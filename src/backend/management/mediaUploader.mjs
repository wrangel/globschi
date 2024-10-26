import fs from "fs";
import path from "path";
import sharp from "sharp";
import { PassThrough } from "stream";
import * as Constants from "../constants.mjs";
import { processedMediaData } from "./metadataCollector.mjs";
import { s3Client } from "../helpers/awsHelpers.mjs";
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

  try {
    // Step 1: Upload original TIF to S3
    console.log("Step 1: Uploading original TIF to S3");
    const tifStream = fs.createReadStream(inputPath);
    await uploadStreamToS3(
      process.env.ORIGINALS_BUCKET,
      `${mediaType}/${newMediumOriginal}`,
      tifStream
    );

    console.log(
      `Uploaded ${originalMedium} to ${mediaType}/${newMediumOriginal}`
    );

    // Step 2: Prepare WebP processing
    console.log("Step 2: Processing and uploading lossless WebP");
    const image = sharp(inputPath); // Initialize image here

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
    console.log("Step 3: Processing and uploading lossy WebP");

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

    // Step 4: Converting to JPEG and saving to OneDrive
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

    // Step 5: Delete the original file
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

async function uploadStreamToS3(bucketName, key, body) {
  console.log(`Starting S3 upload: ${bucketName}/${key}`);

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
    queueSize: 4, // number of concurrent uploads
    partSize: 5 * 1024 * 1024, // 5 MB per part
  });

  try {
    const result = await upload.done();

    console.log(`Completed S3 upload: ${bucketName}/${key}`);

    return result;
  } catch (error) {
    console.error(
      `Error uploading to S3: ${bucketName}/${key} - ${error.message}`
    );

    throw error;
  }
}

async function processAllMediaFiles(processedMediaData) {
  console.log("Starting to process all media files");

  const mediaFileInfo = processedMediaData.mediaFileInfo;

  // Process each media file
  const results = await Promise.all(mediaFileInfo.map(processMediaFile));

  console.log("All media files processed:");

  console.log(results);

  // Insert mongooseCompatibleMetadata into MongoDB
  if (processedMediaData.mongooseCompatibleMetadata) {
    await executeMongoQuery(async () => {
      await Island.insertMany(processedMediaData.mongooseCompatibleMetadata);
      return null; // Return null to indicate no value
    });
    console.log("Inserted mongooseCompatibleMetadata into MongoDB.");
  }
}

// Usage
console.log("Script started");
processAllMediaFiles(processedMediaData)
  .then(() => console.log("Processing complete"))
  .catch((error) => console.error("Error in processing:", error));
