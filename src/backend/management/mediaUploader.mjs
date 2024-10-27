import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PassThrough } from "stream";
import logger from "../helpers/logger.mjs";
import * as Constants from "../constants.mjs";
import { processedMediaData } from "./metadataCollector.mjs";
import { s3Client } from "../helpers/awsHelpers.mjs";
import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../helpers/mongoHelpers.mjs";
import { Upload } from "@aws-sdk/lib-storage";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

// Maximum dimensions for WebP images
const MAX_WEBP_DIMENSION = 16383;

/**
 * Processes a single media file: uploads original TIF, converts to WebP, and saves JPEG.
 * @param {Object} fileInfo - Information about the media file.
 * @returns {Object} Result of the processing operation.
 */
async function processMediaFile(fileInfo) {
  const {
    key,
    originalMedium,
    newMediumOriginal,
    newMediumSite,
    newMediumSmall,
    mediaType,
  } = fileInfo;

  logger.info(`Starting to process ${originalMedium}`);

  const inputPath = path.join(process.env.INPUT_DIRECTORY, originalMedium);

  try {
    // Step 1: Upload original TIF to S3
    logger.info("Step 1: Uploading original TIF to S3");
    const tifStream = fs.createReadStream(inputPath);
    await uploadStreamToS3(
      process.env.ORIGINALS_BUCKET,
      `${mediaType}/${newMediumOriginal}`,
      tifStream
    );

    logger.info(
      `Uploaded ${originalMedium} to ${mediaType}/${newMediumOriginal}`
    );

    // Step 2: Prepare WebP processing
    logger.info("Step 2: Processing and uploading lossless WebP");
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    let resizedImage = image;

    if (
      metadata.width > MAX_WEBP_DIMENSION ||
      metadata.height > MAX_WEBP_DIMENSION
    ) {
      const aspectRatio = metadata.width / metadata.height;
      let newWidth = Math.min(metadata.width, MAX_WEBP_DIMENSION);
      let newHeight = Math.round(newWidth / aspectRatio);

      if (newHeight > MAX_WEBP_DIMENSION) {
        newHeight = MAX_WEBP_DIMENSION;
        newWidth = Math.round(newHeight * aspectRatio);
      }

      resizedImage = image.resize(newWidth, newHeight, { fit: "inside" });
    }

    const losslessWebpBuffer = await resizedImage
      .webp({ lossless: true })
      .toBuffer();

    await uploadStreamToS3(
      process.env.SITE_BUCKET,
      `${mediaType}/${newMediumSite}`,
      losslessWebpBuffer
    );

    // Step 3: Process and upload lossy WebP
    logger.info("Step 3: Processing and uploading lossy WebP");

    let lossyTransformer = resizedImage.webp({ lossless: false, quality: 80 });

    if (mediaType !== "hdr") {
      lossyTransformer = lossyTransformer.resize({
        width: 2000,
        height: 1300,
        fit: "inside",
        position: sharp.strategy.attention,
      });
    }

    const lossyWebpBuffer = await lossyTransformer.toBuffer();

    await uploadStreamToS3(
      process.env.SITE_BUCKET,
      `${Constants.THUMBNAIL_ID}/${newMediumSite}`,
      lossyWebpBuffer
    );

    // Step 4: Convert to JPEG and save to OneDrive
    logger.info("Step 4: Converting to JPEG and saving to OneDrive");

    const onedrivePath = path.join(
      process.env.ONEDRIVE_DIRECTORY,
      newMediumSmall
    );

    logger.info(`OneDrive path: ${onedrivePath}`);

    await sharp(inputPath)
      .jpeg({ quality: 100, progressive: true })
      .withMetadata()
      .toFile(onedrivePath);

    logger.info(`Saved JPEG to ${onedrivePath}`);

    // Step 5: Delete the original file after processing is complete
    logger.info("Step 5: Deleting the original file");

    await fs.promises.unlink(inputPath);
    logger.info(`Deleted original file: ${inputPath}`);

    logger.info(`Completed processing ${originalMedium}`);

    return {
      success: true,
      message: `Processed ${originalMedium} successfully`,
    };
  } catch (error) {
    logger.error(`Error processing ${originalMedium}:`, { error: error.stack });

    return {
      success: false,
      message: `Error processing ${originalMedium}: ${error.message}`,
      error: error.stack,
    };
  }
}

/**
 * Uploads a stream or buffer to an S3 bucket.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} key - The key (filename) under which the file will be stored.
 * @param {Buffer|stream.Readable} body - The content of the file to be uploaded.
 * @returns {Promise<Object>} Result of the upload operation.
 */
async function uploadStreamToS3(bucketName, key, body) {
  logger.info(`Starting S3 upload: ${bucketName}/${key}`);

  const stream = Buffer.isBuffer(body)
    ? (() => {
        const passThroughStream = new PassThrough();
        passThroughStream.end(body);
        return passThroughStream;
      })()
    : body;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: stream,
    },
    queueSize: 4,
    partSize: 5 * 1024 * 1024,
  });

  try {
    const result = await upload.done();
    logger.info(`Completed S3 upload: ${bucketName}/${key}`);
    return result;
  } catch (error) {
    logger.error(`Error uploading to S3: ${bucketName}/${key}`, {
      error: error.stack,
    });
    throw error;
  }
}

/**
 * Processes all media files and updates/inserts their metadata into MongoDB.
 *
 * This function performs the following operations:
 * 1. Processes each media file concurrently using the processMediaFile function.
 * 2. Logs the success or failure of each file processing operation.
 * 3. If mongooseCompatibleMetadata is provided, it updates existing documents
 *    or inserts new ones in the MongoDB database using the Island model.
 *
 * The function uses an upsert operation for each document, which means:
 * - If a document with the same name exists, it updates the existing document.
 * - If no document with the given name exists, it inserts a new document.
 *
 * @param {Object} processedMediaData - An object containing:
 *   @property {Array} mediaFileInfo - Array of objects with information about each media file to process.
 *   @property {Array} [mongooseCompatibleMetadata] - Array of metadata objects to be inserted/updated in MongoDB.
 *
 * @returns {Promise<void>} - A promise that resolves when all operations are complete.
 *
 * @throws Will log an error if there's an issue with processing files or updating/inserting data in MongoDB.
 */
async function processAllMediaFiles(processedMediaData) {
  logger.info("Starting to process all media files");

  const mediaFileInfo = processedMediaData.mediaFileInfo;

  const results = await Promise.all(mediaFileInfo.map(processMediaFile));

  results.forEach((result, index) => {
    if (result.success) {
      logger.info(`Successfully processed file ${index + 1}:`, result.message);
    } else {
      logger.error(
        `Failed to process file ${index + 1}:`,
        result.message,
        result.error
      );
    }
  });

  if (processedMediaData.mongooseCompatibleMetadata) {
    try {
      await executeMongoQuery(async () => {
        for (const doc of processedMediaData.mongooseCompatibleMetadata) {
          await Island.updateOne(
            { name: doc.name }, // Find the document by name
            { $set: doc }, // Update with the new data
            { upsert: true } // Create a new document if it doesn't exist
          );
        }
        return null;
      });
      logger.info("Updated/inserted mongooseCompatibleMetadata into MongoDB.");
    } catch (error) {
      logger.error("Error updating/inserting data into MongoDB:", {
        error: error.stack,
      });
    }
  }
}

// Usage of the script starts here
logger.info("Script started");
processAllMediaFiles(processedMediaData)
  .then(() => logger.info("Processing complete"))
  .catch((error) =>
    logger.error("Error in processing:", { error: error.stack })
  );
