// src/backend/management/handlePano.mjs

import fs from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";
import sharp from "sharp";
import logger from "../utils/logger.mjs";
import {
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_QUALITY,
  THUMBNAIL_FILENAME,
  MODIFIED_FOLDER,
  ORIGINAL_FOLDER,
  S3_FOLDER,
} from "../constants.mjs";

/**
 * Parse levels and initialViewParameters from data.js content.
 * Expects data.js exporting a JavaScript object or assignment with those properties.
 * @param {string} dataJsContent
 * @returns {{levels: any, initialViewParameters: any} | null}
 */
function parseDataJs(dataJsContent) {
  try {
    // Simple regex extraction of properties. Adjust if your data.js format differs.
    const levelsMatch = dataJsContent.match(/levels\s*:\s*(\[[\s\S]*?\])/);
    const initialViewMatch = dataJsContent.match(
      /initialViewParameters\s*:\s*({[\s\S]*?})/
    );

    const levels = levelsMatch ? JSON.parse(levelsMatch[1]) : null;
    const initialViewParameters = initialViewMatch
      ? JSON.parse(initialViewMatch[1])
      : null;

    return { levels, initialViewParameters };
  } catch (err) {
    logger.warn(
      `Failed to parse data.js levels or initialViewParameters: ${err}`
    );
    return null;
  }
}

export async function handlePano(mediaFolderPath, folderName) {
  const modifiedPath = path.join(mediaFolderPath, MODIFIED_FOLDER);
  const originalPath = path.join(mediaFolderPath, ORIGINAL_FOLDER);
  const s3Folder = path.join(modifiedPath, S3_FOLDER);
  const zipPath = path.join(modifiedPath, "project-title.zip");

  logger.info(`[${folderName}]: Starting pano processing`);

  // Move all PANO_<xxxx>.jpg files from root to original folder
  await fs.mkdir(originalPath, { recursive: true });
  const rootFiles = await fs.readdir(mediaFolderPath);
  const panoJpgFiles = rootFiles.filter((f) => /^PANO_\d{4}\.jpe?g$/i.test(f));
  for (const file of panoJpgFiles) {
    const src = path.join(mediaFolderPath, file);
    const dest = path.join(originalPath, file);
    await fs.rename(src, dest);
    logger.info(`[${folderName}]: Moved ${file} to original folder`);
  }

  // Assume s3Folder exists externally (no mkdir here)

  const extractPath = path.join(s3Folder, "project-title-extract-temp");

  try {
    logger.info(`[${folderName}]: Checking ZIP file at ${zipPath}`);
    const stat = await fs.stat(zipPath);
    if (!stat.isFile() || stat.size === 0) {
      logger.warn(
        `[${folderName}]: ZIP file is missing or empty. Skipping pano.`
      );
      return null;
    }

    // Extract project-title.zip into temp folder
    logger.info(`[${folderName}]: Extracting ZIP to ${extractPath}`);
    try {
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
    } catch (zipError) {
      logger.error(
        `[${folderName}]: Error extracting ZIP file: ${zipError.message}`,
        zipError
      );
      throw zipError;
    }
    logger.info(`[${folderName}]: ZIP extraction completed`);

    // Move tiles folder to s3/tiles
    const originalTilesBase = path.join(extractPath, "app-files", "tiles");
    const subfolders = (
      await fs.readdir(originalTilesBase, { withFileTypes: true })
    ).filter((d) => d.isDirectory());

    if (subfolders.length !== 1) {
      logger.warn(
        `[${folderName}]: Expected exactly one subfolder inside extracted tiles folder, found ${subfolders.length}. Skipping tiles move.`
      );
    } else {
      const singleTileSubfolder = path.join(
        originalTilesBase,
        subfolders[0].name
      );
      const s3TilesDest = path.join(s3Folder, "tiles");

      // Delete existing s3/tiles if any
      try {
        await fs.rm(s3TilesDest, { recursive: true, force: true });
        logger.info(`[${folderName}]: Deleted existing s3/tiles folder`);
      } catch (err) {
        logger.warn(
          `[${folderName}]: Could not delete existing s3/tiles folder: ${err.message}`
        );
      }

      // Rename subfolder to s3/tiles
      await fs.rename(singleTileSubfolder, s3TilesDest);
      logger.info(`[${folderName}]: Moved and renamed tiles to s3/tiles`);

      // Remove extracted tiles base folder
      try {
        await fs.rm(originalTilesBase, { recursive: true, force: true });
        logger.info(`[${folderName}]: Deleted extracted tiles base folder`);
      } catch (err) {
        logger.warn(
          `[${folderName}]: Could not delete extracted tiles base folder: ${err.message}`
        );
      }
    }

    // Parse data.js file for properties
    const dataJsPath = path.join(extractPath, "app-files", "data.js");
    let extractedProperties = null;
    try {
      const dataJsContent = await fs.readFile(dataJsPath, "utf8");
      extractedProperties = parseDataJs(dataJsContent);
      if (extractedProperties) {
        logger.info(
          `[${folderName}]: Extracted levels and initialViewParameters from data.js`
        );
      } else {
        logger.warn(
          `[${folderName}]: Failed to extract levels or initialViewParameters from data.js`
        );
      }
    } catch (err) {
      logger.warn(`[${folderName}]: Could not read data.js: ${err.message}`);
    }

    // Remove extraction temp folder
    try {
      await fs.rm(extractPath, { recursive: true, force: true });
      logger.info(`[${folderName}]: Deleted project-title extraction folder`);
    } catch (err) {
      logger.warn(
        `[${folderName}]: Could not delete extraction folder: ${err.message}`
      );
    }

    // Create thumbnail.webp from JPG inside modified folder into s3 folder
    const modifiedFiles = await fs.readdir(modifiedPath);
    const jpgFile = modifiedFiles.find((f) => /\.jpe?g$/i.test(f));
    if (!jpgFile) {
      logger.warn(
        `[${folderName}]: No JPG found in modified folder for thumbnail`
      );
      return extractedProperties;
    }
    const inputPath = path.join(modifiedPath, jpgFile);
    const thumbnailPath = path.join(s3Folder, THUMBNAIL_FILENAME);
    logger.info(`[${folderName}]: Creating thumbnail.webp at ${thumbnailPath}`);
    await sharp(inputPath)
      .resize({
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        fit: "inside",
        position: sharp.strategy.attention,
      })
      .webp({ quality: THUMBNAIL_QUALITY })
      .toFile(thumbnailPath);
    logger.info(`[${folderName}]: Created thumbnail.webp successfully`);

    return extractedProperties;
  } catch (err) {
    logger.error(
      `[${folderName}]: Error in handlePano processing: ${err.message}`,
      err
    );
    throw err;
  }
}
