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
    const image = sharp(inputPath); // Initialize image processing

    const metadata = await image.metadata(); // Get image metadata
    let resizedImage = image; // Initialize resizedImage

    // Resize if dimensions exceed maximum allowed size
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

    /*
    // Step 5: Delete the original file after processing is complete
    logger.info("Step 5: Deleting the original file");

    fs.unlink(inputPath, (err) => {
      if (err) {
        logger.error(`Error deleting file ${inputPath}:`, { error: err });
      } else {
        logger.info(`Deleted original file: ${inputPath}`);
      }
    });
    */

    logger.info(`Completed processing ${originalMedium}`);

    return {
      success: true,
      message: `Processed ${originalMedium} successfully`,
    };
  } catch (error) {
    logger.error(`Error processing ${originalMedium}:`, { error });

    return {
      success: false,
      message: `Error processing ${originalMedium}: ${error.message}`,
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

  // If body is a buffer, convert it to a readable stream
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
    queueSize: 4, // Number of concurrent uploads
    partSize: 5 * 1024 * 1024, // Size of each part in bytes (5 MB)
  });

  try {
    const result = await upload.done(); // Wait for the upload to complete

    logger.info(`Completed S3 upload: ${bucketName}/${key}`);

    return result;
  } catch (error) {
    logger.error(
      `Error uploading to S3: ${bucketName}/${key} - ${error.message}`
    );

    throw error; // Rethrow error for further handling
  }
}

/**
 * Processes all media files based on provided data.
 * @param {Object} processedMediaData - Data containing media file information and metadata.
 */
async function processAllMediaFiles(processedMediaData) {
  logger.info("Starting to process all media files");

  const mediaFileInfo = processedMediaData.mediaFileInfo;

  // Process each media file concurrently using Promise.all
  const results = await Promise.all(mediaFileInfo.map(processMediaFile));

  logger.info("All media files processed:");

  logger.info(results);

  // Insert mongooseCompatibleMetadata into MongoDB if available
  if (processedMediaData.mongooseCompatibleMetadata) {
    await executeMongoQuery(async () => {
      await Island.insertMany(processedMediaData.mongooseCompatibleMetadata);
      return null; // Return null to indicate no value
    });

    logger.info("Inserted mongooseCompatibleMetadata into MongoDB.");
  }
}

// Usage of the script starts here
logger.info("Script started");
processAllMediaFiles(processedMediaData)
  .then(() => logger.info("Processing complete"))
  .catch((error) => logger.error("Error in processing:", { error }));
