// src/backend/management/mediaUploader.mjs

import sharp from "sharp";
import sharp from "sharp";
import path from "path";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { processedMediaData } from "./metadataCollector.mjs";
import * as Constants from "../constants.mjs";
import { s3Client } from "../awsConfigurator.mjs";
IM;

async function processMediaFile(fileInfo) {
  const {
    key,
    originalMedium,
    newMediumOriginal,
    newMediumSite,
    newMediumSmall,
    mediaType,
  } = fileInfo;

  const inputPath = path.join(process.env.INPUT_DIRECTORY, originalMedium);

  try {
    // Step 1: Get the TIF file as a stream
    const tifStream = await getFileAsStream(inputPath);

    // Step 2: Upload original TIF to S3
    await uploadStreamToS3(
      process.env.ORIGINALS_BUCKET,
      `${mediaType}/${newMediumOriginal}`,
      tifStream
    );

    // Step 3: Process and upload lossless WebP
    const losslessWebpStream = sharp().webp({ lossless: true }).pipe();

    tifStream.pipe(losslessWebpStream);

    await uploadStreamToS3(
      process.env.SITE_BUCKET,
      `${mediaType}/${newMediumSite}`,
      losslessWebpStream
    );

    // Step 4: Process and upload lossy WebP
    const lossyTransformer = sharp().webp({ lossless: false });
    if (mediaType !== "hdr") {
      lossyTransformer.resize({
        width: 2000,
        height: 1300,
        fit: "inside",
        position: sharp.strategy.attention,
      });
    }
    const lossyWebpStream = lossyTransformer.pipe();

    tifStream.pipe(lossyTransformer);

    await uploadStreamToS3(
      process.env.SITE_BUCKET,
      `${Constants.THUMBNAIL_ID}/${newMediumSite}`,
      lossyWebpStream
    );

    // Step 5: Convert to JPEG and save to OneDrive
    const onedrivePath = path.join(
      process.env.ONEDRIVE_DIRECTORY,
      newMediumSmall
    );
    await sharp(await getFileBuffer(inputPath))
      .jpeg({
        quality: 100,
        progressive: true,
      })
      .withMetadata()
      .toFile(onedrivePath);

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

async function getFileAsStream(filePath) {
  const command = new GetObjectCommand({
    Bucket: process.env.INPUT_BUCKET,
    Key: filePath,
  });

  const response = await s3Client.send(command);
  return response.Body;
}

async function getFileBuffer(filePath) {
  const stream = await getFileAsStream(filePath);
  return streamToBuffer(stream);
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
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
    console.log(`Uploaded stream to S3: ${key}`);
    return response;
  } catch (error) {
    console.error(`Error uploading stream to S3: ${key}`, error);
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
