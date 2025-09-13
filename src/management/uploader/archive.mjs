// src/backend/management/uploader/archive.mjs

import { readdir, access, rename, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import logger from "../../backend/utils/logger.mjs";

const ARCHIVE_DIRECTORY = process.env.ARCHIVE_DIRECTORY;
const OUTPUT_DIRECTORY = process.env.OUTPUT_DIRECTORY;

/**
 * Converts either X/modified/X.tiff or X/modified/?Panorama?.jpg to high quality JPG named X.jpg in the output folder
 * @param {string} folderPath Absolute path to folder X
 * @param {string} folderName Name X of the folder
 * @returns {Promise<boolean>} true if converted, false if no convertible source found
 */
async function convertImage(folderPath, folderName) {
  const modifiedDir = path.join(folderPath, "modified");
  const jpgOut = path.join(OUTPUT_DIRECTORY, `${folderName}.jpg`);
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });

  // Try TIFF first
  const tiffFile = path.join(modifiedDir, `${folderName}.tiff`);
  try {
    await access(tiffFile);
    await sharp(tiffFile).jpeg({ quality: 95 }).toFile(jpgOut);
    logger.info(`Converted TIFF to ${jpgOut}`);
    return true;
  } catch {}

  // Otherwise try ?Panorama?.jpg
  const files = await readdir(modifiedDir);
  const panoramaJpg = files.find(
    (f) =>
      f.toLowerCase().endsWith(".jpg") && f.toLowerCase().includes("panorama")
  );
  if (panoramaJpg) {
    const inJpg = path.join(modifiedDir, panoramaJpg);
    await sharp(inJpg).jpeg({ quality: 95 }).toFile(jpgOut);
    logger.info(`Converted panorama JPG to ${jpgOut}`);
    return true;
  }

  logger.warn(`No TIFF or panorama JPG found for ${folderName} in folder`);
  return false;
}

/**
 * Moves the folder X to the archive directory if not already present.
 * @param {string} folderPath Absolute path to folder X
 * @param {string} folderName Name X of the folder
 * @returns {Promise<string|null>} new archive path if moved, or null if archive exists
 */
async function archiveFolder(folderPath, folderName) {
  const archivePath = path.join(ARCHIVE_DIRECTORY, folderName);
  try {
    await access(archivePath); // Will throw if archive doesn't exist
    logger.warn(`Archive folder ${archivePath} already exists. Skipping move.`);
    return null;
  } catch {
    await rename(folderPath, archivePath);
    logger.info(`Moved folder ${folderName} to archive at ${archivePath}`);
    return archivePath;
  }
}

/**
 * Main function to convert images then archive the folder.
 * @param {string} folderPath Absolute path to folder X
 * @param {string} folderName Name X of the folder
 */
export async function convertThenArchive(folderPath, folderName) {
  const converted = await convertImage(folderPath, folderName);
  if (!converted) {
    logger.warn(
      `Skipping archiving for ${folderName} due to no convertible image.`
    );
    return;
  }
  await archiveFolder(folderPath, folderName);
}

// CLI entrypoint for manual testing
if (process.argv[1] === new URL(import.meta.url).pathname) {
  // Accept optional args to process single folder
  const folderArg = process.argv[2];
  const nameArg = process.argv[3];

  if (!folderArg || !nameArg) {
    logger.error("Usage: node archive.mjs <folderPath> <folderName>");
    process.exit(1);
  }

  convertThenArchive(folderArg, nameArg).catch((err) => {
    logger.error("Uncaught error in convertThenArchive", { error: err });
    process.exit(1);
  });
}
