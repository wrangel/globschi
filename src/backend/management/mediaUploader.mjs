// src/backend/management/mediaUploader.mjs

import fs from "fs";
import path from "path";
import sharp from "sharp";
import * as Constants from "../constants.mjs";
import { uploadStreamToS3 } from "../helpers/awsHelpers.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

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
    const tifStream = fs.createReadStream(inputPath);

    // Step 2: Upload original TIF to S3
    await uploadStreamToS3(
      process.env.ORIGINALS_BUCKET,
      `${mediaType}/${newMediumOriginal}`,
      tifStream
    );

    // Step 3: Process and upload lossless WebP
    const losslessWebpStream = sharp(inputPath).webp({ lossless: true });

    await uploadStreamToS3(
      process.env.SITE_BUCKET,
      `${mediaType}/${newMediumSite}`,
      losslessWebpStream
    );

    // Step 4: Process and upload lossy WebP
    let lossyTransformer = sharp(inputPath).webp({ lossless: false });
    if (mediaType !== "hdr") {
      lossyTransformer = lossyTransformer.resize({
        width: 2000,
        height: 1300,
        fit: "inside",
        position: sharp.strategy.attention,
      });
    }

    await uploadStreamToS3(
      process.env.SITE_BUCKET,
      `${Constants.THUMBNAIL_ID}/${newMediumSite}`,
      lossyTransformer
    );

    // Step 5: Convert to JPEG and save to OneDrive
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
