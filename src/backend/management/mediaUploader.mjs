// src/backend/management/mediaUploader.mjs

import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../helpers/mongoHelpers.mjs";
import { processedMediaData } from "./metadataCollector.mjs";

console.log(processedMediaData.mediaFileInfo);

/**
 * Convert media files to different formats.
 * @param {Array} mediaFileInfo - Array of media file information.
 * @returns {Promise<Array>} Updated media file information with conversion results.
 */
async function convertMediaFiles(mediaFileInfo) {
  return Promise.all(
    mediaFileInfo.map(async (fi) => {
      const inputFile = path.join(
        process.env.INPUT_DIRECTORY,
        fi.originalMedium
      );
      const siteFile = path.join(process.env.INPUT_DIRECTORY, fi.newMediumSite);
      const smallFile = path.join(
        process.env.INPUT_DIRECTORY,
        fi.newMediumSmall
      );

      try {
        // Convert to webp for site
        const transformer = sharp(inputFile);
        if (fi.mediaType !== "hdr") {
          transformer.resize({
            width: 2000,
            height: 1300,
            fit: "inside",
            position: sharp.strategy.attention,
          });
        }
        await transformer
          .webp({ lossless: false, quality: 80 })
          .toFile(siteFile);

        // Convert to jpg for small version
        await sharp(inputFile)
          .jpeg({ quality: 100 })
          .withMetadata()
          .toFile(smallFile);

        return {
          ...fi,
          converted: true,
          conversionPaths: {
            site: siteFile,
            small: smallFile,
          },
        };
      } catch (error) {
        console.error(`Error converting file ${fi.originalMedium}:`, error);
        return {
          ...fi,
          converted: false,
          error: error.message,
        };
      }
    })
  );
}

await convertMediaFiles(processedMediaData.mediaFileInfo);

process.exit(0);

// 6) Update documents to MongoDB

await executeMongoQuery(async () => {
  await Island.insertMany(media3);
  return null; // Return null to indicate no value
});

process.exit(0);
/////////

/// C) Convert file to .jpeg, copy .jpeg to OneDrive, move .tif to 'done' folder
await Promise.all(
  media.map(async (fi) => {
    const inputFile = path.join(process.env.INPUT_DIRECTORY, fi.originalMedium);
    // Handle jpegs
    await sharp(inputFile)
      .jpeg({ quality: 100 })
      .withMetadata()
      .toFile(path.join(process.env.ONEDRIVE_DIRECTORY, fi.newMediumSmall));
    // Handle .tifs
    fs.rename(
      inputFile,
      path.join(process.env.OUTPUT_DIRECTORY, fi.newMediumOriginal),
      function (err) {
        if (err) {
          throw err;
        } else {
          console.log(`Successfully moved ${inputFile}`);
        }
      }
    );
  })
);

/// D) Upload media to AWS S3 (requires AWS CLI with proper authentication: Alternative would be an S3 client)
await Promise.all(
  media.map((fi) =>
    runCli(
      `aws s3 cp ${process.env.OUTPUT_DIRECTORY}${fi.sourceFile} s3://${process.env.ORIGINALS_BUCKET}/${fi.mediaType}/${fi.targetFile}`
    )
  )
);
