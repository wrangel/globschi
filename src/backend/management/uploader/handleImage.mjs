// src/backend/management/uploader/handleImage.mjs

import fs from "fs/promises";
import path from "path";
import logger from "../../utils/logger.mjs";
import {
  MODIFIED_FOLDER,
  ORIGINAL_FOLDER,
  S3_FOLDER,
} from "../../constants.mjs";
import sharp from "sharp";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/**
 * Rename folder to newName.
 * Move JPG files to original folder.
 * Move TIFF file to modified folder, convert it to WebP images in modified/S3.
 * @param {string} originalFolderPath
 * @param {string} newName
 * @returns {Promise<string>} new folder path
 */
export async function handleImage(originalFolderPath, newName) {
  const parentDir = path.dirname(originalFolderPath);
  const newFolderPath = path.join(parentDir, newName);

  if (originalFolderPath !== newFolderPath) {
    await fs.rename(originalFolderPath, newFolderPath);
    logger.info(
      `Renamed folder: '${originalFolderPath}' to '${newFolderPath}'`
    );
  } else {
    logger.info(
      `No rename needed: '${originalFolderPath}' is already named '${newName}'`
    );
  }

  // Paths
  const modifiedPath = path.join(newFolderPath, MODIFIED_FOLDER);
  const originalPath = path.join(newFolderPath, ORIGINAL_FOLDER);
  const s3Path = path.join(modifiedPath, S3_FOLDER);

  // Ensure subfolders exist (create if missing)
  await Promise.all([
    fs.mkdir(modifiedPath, { recursive: true }),
    fs.mkdir(originalPath, { recursive: true }),
    fs.mkdir(s3Path, { recursive: true }),
  ]);

  const files = await fs.readdir(newFolderPath);

  // Move all JPG/JPEG files from root to original folder
  const jpgFiles = files.filter(
    (f) => f.toLowerCase().endsWith(".jpg") || f.toLowerCase().endsWith(".jpeg")
  );

  for (const file of jpgFiles) {
    const src = path.join(newFolderPath, file);
    const dest = path.join(originalPath, file);
    await fs.rename(src, dest);
    logger.info(`Moved JPG file ${file} to ${originalPath}`);
  }

  // Move TIFF file to modified folder (assume only one TIFF)
  const tiffFiles = files.filter((f) => /\.tiff?$/i.test(f));
  if (tiffFiles.length === 0) {
    logger.warn(`No TIFF files found in ${newFolderPath}`);
  } else {
    const tiffFile = tiffFiles[0];
    const srcTiff = path.join(newFolderPath, tiffFile);
    const destTiff = path.join(modifiedPath, tiffFile);
    await fs.rename(srcTiff, destTiff);
    logger.info(`Moved TIFF file ${tiffFile} to ${modifiedPath}`);

    // Convert TIFF to WebPs in s3 folder
    const tempPngPath = path.join(s3Path, `${newName}_temp.png`);

    try {
      // Convert TIFF to PNG with ImageMagick
      await execFileAsync("magick", [
        destTiff,
        "-depth",
        "8",
        "-normalize",
        tempPngPath,
      ]);
      logger.info(`Converted TIFF to PNG: ${tempPngPath}`);

      const image = sharp(tempPngPath);
      const metadata = await image.metadata();

      // Create lossless WebP
      let hrImage = image;
      if (metadata.width > 16383 || metadata.height > 16383) {
        const aspectRatio = metadata.width / metadata.height;
        let newWidth = Math.min(metadata.width, 16383);
        let newHeight = Math.round(newWidth / aspectRatio);
        if (newHeight > 16383) {
          newHeight = 16383;
          newWidth = Math.round(newHeight * aspectRatio);
        }
        hrImage = image.resize(newWidth, newHeight, { fit: "inside" });
      }
      const losslessWebpPath = path.join(s3Path, `${newName}.webp`);
      await hrImage.webp({ lossless: true }).toFile(losslessWebpPath);

      // Create thumbnail WebP
      const THUMBNAIL_QUALITY = 80;
      const THUMBNAIL_WIDTH = 2000;
      const THUMBNAIL_HEIGHT = 1300;
      const THUMBNAIL_FILENAME = "thumbnail.webp";

      const thumbnailWebpPath = path.join(s3Path, THUMBNAIL_FILENAME);
      const tnImage = image
        .webp({ lossless: false, quality: THUMBNAIL_QUALITY })
        .resize({
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_HEIGHT,
          fit: "inside",
          position: sharp.strategy.attention,
        });
      await tnImage.toFile(thumbnailWebpPath);

      // Delete temp PNG
      await fs.unlink(tempPngPath);

      logger.info(
        "Completed TIFF to WebP conversion and stored in modified/S3"
      );
    } catch (error) {
      logger.error("Error processing TIFF to WebP:", error);
    }
  }

  return newFolderPath;
}
