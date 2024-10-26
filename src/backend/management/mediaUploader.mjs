// src/backend/management/mediaUploader.mjs

import fs from "fs";
import path from "path";
import sharp from "sharp";
import * as Constants from "../constants.mjs";
import { processedMediaData } from "./metadataCollector.mjs";
import { s3Client } from "../awsConfigurator.mjs";
import { Upload } from "@aws-sdk/lib-storage";
import { loadEnv } from "../loadEnv.mjs";

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
  console.log(`Starting to process ${originalMedium}`);

  const inputPath = path.join(process.env.INPUT_DIRECTORY, originalMedium);
  console.log(`Input path: ${inputPath}`);

  try {
    console.log("Step 1: Uploading original TIF to S3");
    const tifStream = fs.createReadStream(inputPath);
    await uploadStreamToS3(
      process.env.ORIGINALS_BUCKET,
      `${mediaType}/${newMediumOriginal}`,
      tifStream
    );
    console.log(
      `Uploaded ${originalMedium} to ${mediaType}/${newMediumOriginal} in bucket ${process.env.ORIGINALS_BUCKET}`
    );

    console.log("Step 2: Processing and uploading lossless WebP");
    console.log("Creating Sharp instance");
    const image = sharp(inputPath);
    console.log("Getting image metadata");
    const metadata = await image.metadata();
    console.log(`Image metadata: ${JSON.stringify(metadata)}`);

    let resizedImage = image;
    if (
      metadata.width > MAX_WEBP_DIMENSION ||
      metadata.height > MAX_WEBP_DIMENSION
    ) {
      console.log("Image exceeds maximum WebP dimensions, resizing");
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

    console.log("Converting to lossless WebP");
    const losslessWebpBuffer = await resizedImage
      .webp({ lossless: true, effort: 6 })
      .toBuffer();
    console.log("Lossless WebP conversion complete");

    console.log("Uploading lossless WebP to S3");
    await uploadStreamToS3(
      process.env.SITE_BUCKET,
      `${mediaType}/${newMediumSite}`,
      losslessWebpBuffer
    );
    console.log(
      `Uploaded lossless WebP to ${mediaType}/${newMediumSite} in bucket ${process.env.SITE_BUCKET}`
    );

    console.log("Step 3: Processing and uploading lossy WebP");
    let lossyTransformer = resizedImage.webp({ lossless: false, quality: 80 });
    if (mediaType !== "hdr") {
      console.log("Applying additional resize for non-HDR image");
      lossyTransformer = lossyTransformer.resize({
        width: 2000,
        height: 1300,
        fit: "inside",
        position: sharp.strategy.attention,
      });
    }
    console.log("Converting to lossy WebP");
    const lossyWebpBuffer = await lossyTransformer.toBuffer();
    console.log("Lossy WebP conversion complete");

    console.log("Uploading lossy WebP to S3");
    await uploadStreamToS3(
      process.env.SITE_BUCKET,
      `${Constants.THUMBNAIL_ID}/${newMediumSite}`,
      lossyWebpBuffer
    );
    console.log(
      `Uploaded lossy WebP to ${Constants.THUMBNAIL_ID}/${newMediumSite} in bucket ${process.env.SITE_BUCKET}`
    );

    console.log("Step 4: Converting to JPEG and saving to OneDrive");
    const onedrivePath = path.join(
      process.env.ONEDRIVE_DIRECTORY,
      newMediumSmall
    );
    console.log(`OneDrive path: ${onedrivePath}`);
    await sharp(inputPath)
      .jpeg({
        quality: 100,
        progressive: true,
      })
      .withMetadata()
      .toFile(onedrivePath);
    console.log(`Saved JPEG to ${onedrivePath}`);

    console.log("Step 5: Deleting the original file");
    fs.unlink(inputPath, (err) => {
      if (err) {
        console.error(`Error deleting file ${inputPath}:`, err);
      } else {
        console.log(`Deleted original file: ${inputPath}`);
      }
    });

    console.log(`Completed processing ${originalMedium}`);
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
  console.log(`Starting S3 upload: ${bucketName}/${key}`);
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: stream,
    },
  });

  try {
    const result = await upload.done();
    console.log(`Completed S3 upload: ${bucketName}/${key}`);
    return result;
  } catch (error) {
    console.error(`Error uploading to S3: ${bucketName}/${key}`, error);
    throw error;
  }
}

async function processAllMediaFiles(mediaFileInfo) {
  console.log("Starting to process all media files");
  const results = await Promise.all(mediaFileInfo.map(processMediaFile));
  console.log("All media files processed:");
  console.log(results);
}

// Usage
console.log("Script started");
processAllMediaFiles(processedMediaData.mediaFileInfo)
  .then(() => console.log("Processing complete"))
  .catch((error) => console.error("Error in processing:", error));
