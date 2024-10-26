// src/backend/management/mediaUploader.mjs

import fs from "fs";
import path from "path";
import sharp from "sharp";
import * as Constants from "../constants.mjs";
import { processedMediaData } from "./metadataCollector.mjs";
import { loadEnv } from "../loadEnv.mjs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../awsConfigurator.mjs";

loadEnv();

const MAX_WEBP_DIMENSION = 16383;

async function processMediaFile(fileInfo) {
  const {
    key,
    originalMedium,
    newMediumOriginal,
    newMediumSite,
    newMediumSmall,
    mediaType,
  } = fileInfo;
  console.log(`Processing ${originalMedium}`);

  const inputPath = path.join(process.env.INPUT_DIRECTORY, originalMedium);

  try {
    // Step 1: Upload original TIF to S3
    const tifStream = fs.createReadStream(inputPath);
    await uploadStreamToS3(
      process.env.ORIGINALS_BUCKET,
      `${mediaType}/${newMediumOriginal}`,
      tifStream
    );
    console.log(
      `Uploaded ${originalMedium} to ${mediaType}/${newMediumOriginal} in bucket ${process.env.ORIGINALS_BUCKET}`
    );

    // Step 2: Process and upload lossless WebP
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
      console.log(
        `Resized image to ${newWidth}x${newHeight} for WebP conversion`
      );
    }

    const losslessWebpBuffer = await resizedImage
      .webp({ lossless: true, effort: 6 })
      .toBuffer();

    await uploadStreamToS3(
      process.env.SITE_BUCKET,
      `${mediaType}/${newMediumSite}`,
      Readable.from(losslessWebpBuffer)
    );
    console.log(
      `Uploaded lossless WebP to ${mediaType}/${newMediumSite} in bucket ${process.env.SITE_BUCKET}`
    );

    // Step 3: Process and upload lossy WebP
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
      Readable.from(lossyWebpBuffer)
    );
    console.log(
      `Uploaded lossy WebP to ${Constants.THUMBNAIL_ID}/${newMediumSite} in bucket ${process.env.SITE_BUCKET}`
    );

    // Step 4: Convert to JPEG and save to OneDrive
    const onedrivePath = path.join(
      process.env.ONEDRIVE_DIRECTORY,
      newMediumSmall
    );
    await sharp(inputPath)
      .jpeg({
        quality: 100,
        progressive: true,
      })
      .withMetadata()
      .toFile(onedrivePath);
    console.log(`Saved JPEG to ${onedrivePath}`);

    return {
      success: true,
      message: `Processed ${originalMedium} successfully`,
    };
  } catch (error) {
    console.error(`Error processing ${originalMedium}:`, error);
    return {
      success: false,
      message: `Error processing ${originalMedium}: ${error.message}`,
    };
  }
}

async function uploadStreamToS3(bucketName, key, stream) {
  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: stream,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    const response = await s3Client.send(command);
    console.log(`Uploaded to S3: ${key}`);
    return response;
  } catch (error) {
    console.error(`Error uploading to S3: ${key}`, error);
    throw error;
  }
}

async function processAllMediaFiles(mediaFileInfoArray) {
  const results = await Promise.all(mediaFileInfoArray.map(processMediaFile));
  console.log("All media files processed:");
  console.log(results);
}

// Usage
processAllMediaFiles(processedMediaData.mediaFileInfo)
  .then(() => console.log("Processing complete"))
  .catch((error) => console.error("Error in processing:", error));
