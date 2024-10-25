// src/backend/management/mediaUploader.mjs

import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { processedMediaData } from "./metadataCollector.mjs";
import { uploadFileToS3 } from "./helpers/awsHelpers.mjs";

// Function to convert images to WebP with lossless compression
async function convertToWebP(inputFile, outputFile) {
  try {
    await sharp(inputFile)
      .resize({
        width: 16380, // Set width just below the max dimension for webp
        height: 16380, // Set height just below the max dimension for webp
        fit: "inside",
        position: sharp.strategy.attention,
      })
      .webp({
        lossless: true, // Enable lossless compression
      })
      .toFile(outputFile);
  } catch (error) {
    console.error(`Error converting ${inputFile} to WebP:`, error);
    throw error; // Rethrow error for further handling
  }
}

// Function to convert images to JPEG with high quality
async function convertToJPEG(inputFile, outputFile) {
  try {
    await sharp(inputFile)
      .jpeg({
        quality: 100, // Set quality to maximum
        progressive: true, // Use progressive loading
      })
      .withMetadata() // Preserve metadata if needed
      .toFile(outputFile);
  } catch (error) {
    console.error(`Error converting ${inputFile} to JPEG:`, error);
    throw error; // Rethrow error for further handling
  }
}

// Main function to process media files
async function processMediaFiles(mediaFileInfo) {
  return Promise.all(
    mediaFileInfo.map(async (fi) => {
      console.log("Processing " + fi.originalMedium);
      const inputFile = path.join(
        process.env.INPUT_DIRECTORY,
        fi.originalMedium
      );
      const originalCopy = path.join(
        process.env.INPUT_DIRECTORY,
        fi.newMediumOriginal
      );
      const siteFile = path.join(process.env.INPUT_DIRECTORY, fi.newMediumSite);
      const smallFile = path.join(
        process.env.INPUT_DIRECTORY,
        fi.newMediumSmall
      );

      try {
        // Copy originalMedium to newMediumOriginal
        await fs.copyFile(inputFile, originalCopy);
        console.log(`Copied ${fi.originalMedium} to ${fi.newMediumOriginal}`);

        // Convert to WebP
        await convertToWebP(inputFile, siteFile);

        // Convert to JPEG for small version
        await convertToJPEG(inputFile, smallFile);

        return {
          ...fi,
          converted: true,
          conversionPaths: {
            site: siteFile,
            small: smallFile,
            originalCopy: originalCopy,
          },
        };
      } catch (error) {
        console.error(`Error processing file ${fi.originalMedium}:`, error);
        return {
          ...fi,
          converted: false,
          error: error.message,
        };
      }
    })
  );
}

processMediaFiles(processedMediaData.mediaFileInfo)
  .then(() => {
    console.log("All media files processed successfully.");
  })
  .catch((error) => {
    console.error("Error processing media files:", error);
  });
