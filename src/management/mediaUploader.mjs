// src/backend/management/mediaUploader.mjs

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PassThrough } from "stream";
import { execFile } from "child_process";
import { promisify } from "util";
import logger from "../helpers/logger.mjs";
import { THUMBNAIL_ID } from "../constants.mjs";
import { processedMediaData } from "./metadataCollector.mjs";
import { s3Client } from "../helpers/awsHelpers.mjs";
import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../helpers/mongoHelpers.mjs";
import { Upload } from "@aws-sdk/lib-storage";

const execFileAsync = promisify(execFile);
const MAX_WEBP_DIMENSION = 16383;

// Preprocess 32-bit TIFF to 8-bit PNG using ImageMagick CLI
async function preprocessTiffToPng(inputPath, tempPngPath) {
  // Convert 32-bit TIFF to 8-bit PNG with normalization
  // Adjust command if 'magick' is 'convert' on your system
  await execFileAsync("magick", [
    inputPath,
    "-depth",
    "8",
    "-normalize",
    tempPngPath,
  ]);
}

/**
 * Uploads a stream or buffer to an S3 bucket.
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
      StorageClass: "INTELLIGENT_TIERING",
      ServerSideEncryption: "AES256",
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
 * Processes a single media file: uploads original TIF, converts to WebP and JPEG.
 */
async function processMediaFile(fileInfo) {
  const {
    originalMedium,
    newMediumOriginal,
    newMediumSite,
    newMediumSmall,
    mediaType,
  } = fileInfo;

  logger.info(`Starting to process ${originalMedium}`);

  const inputPath = path.join(process.env.INPUT_DIRECTORY, originalMedium);

  // Temporary PNG path for normalized image
  const tempPngPath = path.join(
    process.env.INPUT_DIRECTORY,
    `temp_${newMediumOriginal}.png`
  );

  try {
    logger.info("Step 1: Uploading original TIF to S3");
    const tifStream = fs.createReadStream(inputPath);
    await uploadStreamToS3(
      process.env.AWS_BUCKET_ORIGINALS,
      `${mediaType}/${newMediumOriginal}`,
      tifStream
    );
    logger.info(
      `Uploaded ${originalMedium} to ${mediaType}/${newMediumOriginal}`
    );

    // Preprocess TIFF (for 32-bit normalization)
    logger.info("Step 2: Preprocessing TIFF to 8-bit PNG with ImageMagick");
    await preprocessTiffToPng(inputPath, tempPngPath);

    // Load preprocessed PNG with sharp
    let image = sharp(tempPngPath);
    const metadata = await image.metadata();

    // Resize if needed for WebP
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

      image = image.resize(newWidth, newHeight, { fit: "inside" });
    }

    // Step 3: Process and upload lossless WebP
    logger.info("Step 3: Processing and uploading lossless WebP");
    const losslessWebpBuffer = await image.webp({ lossless: true }).toBuffer();

    await uploadStreamToS3(
      process.env.AWS_BUCKET_SITE,
      `${mediaType}/${newMediumSite}`,
      losslessWebpBuffer
    );

    // Step 4: Process and upload lossy WebP
    logger.info("Step 4: Processing and uploading lossy WebP");
    let lossyTransformer = image.webp({ lossless: false, quality: 80 });

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
      process.env.AWS_BUCKET_SITE,
      `${THUMBNAIL_ID}/${newMediumSite}`,
      lossyWebpBuffer
    );

    // Step 5: Convert to JPEG and save to OneDrive
    logger.info("Step 5: Converting to JPEG and saving to OneDrive");

    const onedrivePath = path.join(
      process.env.ONEDRIVE_DIRECTORY,
      newMediumSmall
    );

    await image
      .removeAlpha()
      .jpeg({ quality: 100, progressive: true })
      .withMetadata()
      .toFile(onedrivePath);

    logger.info(`Saved JPEG to ${onedrivePath}`);

    // Step 6: Delete temp PNG file
    try {
      await fs.promises.unlink(tempPngPath);
      logger.info(`Deleted temporary file: ${tempPngPath}`);
    } catch (err) {
      logger.warn(`Could not delete temp PNG: ${tempPngPath}`, {
        error: err.stack,
      });
    }

    // Step 7: Delete original TIFF (if not HDR)
    if (mediaType !== "hdr") {
      logger.info("Step 7: Deleting the original TIF");
      try {
        await fs.promises.unlink(inputPath);
        logger.info(`Deleted original TIFF: ${inputPath}`);
      } catch (unlinkError) {
        logger.warn(`Failed to delete original TIFF: ${inputPath}`, {
          error: unlinkError.stack,
        });
      }
    } else {
      logger.info(`Skipping deletion of HDR TIFF: ${inputPath}`);
    }

    logger.info(`Completed processing ${originalMedium}`);

    return {
      success: true,
      message: `Processed ${originalMedium} successfully`,
    };
  } catch (error) {
    logger.error(`Error processing ${originalMedium}:`, { error: error.stack });
    // Clean up temp PNG in case of error
    try {
      await fs.promises.unlink(tempPngPath);
    } catch (_) {}

    return {
      success: false,
      message: `Error processing ${originalMedium}: ${error.message}`,
      error: error.stack,
    };
  }
}

/**
 * Processes all media files and updates/inserts their metadata into MongoDB.
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
            { name: doc.name },
            { $set: doc },
            { upsert: true }
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

logger.info("Script started");
processAllMediaFiles(processedMediaData)
  .then(() => logger.info("Processing complete"))
  .catch((error) =>
    logger.error("Error in processing:", { error: error.stack })
  );
