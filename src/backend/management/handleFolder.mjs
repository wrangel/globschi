// src/backend/management/handleFolder.mjs

import fs from "fs/promises";
import path from "path";
import logger from "../utils/logger.mjs";
import { MODIFIED_FOLDER, ORIGINAL_FOLDER, S3_FOLDER } from "../constants.mjs";

const modifiedPath = path.join(newFolderPath, MODIFIED_FOLDER);
const originalPath = path.join(newFolderPath, ORIGINAL_FOLDER);
const s3Path = path.join(modifiedPath, S3_FOLDER);

/**
 * Rename a folder to the new name.
 * Ensures subfolders 'modified', 'original', and 'modified/S3' are created.
 * @param {string} originalFolderPath - The full path of the folder to rename.
 * @param {string} newName - The new name for the folder.
 * @returns {Promise<string>} - The path to the renamed folder.
 */
export async function handleFolder(originalFolderPath, newName) {
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

  // Create required subfolders
  const modifiedPath = path.join(newFolderPath, "modified");
  const originalPath = path.join(newFolderPath, "original");
  const s3Path = path.join(modifiedPath, "S3");

  await Promise.all([
    fs.mkdir(modifiedPath, { recursive: true }),
    fs.mkdir(originalPath, { recursive: true }),
    fs.mkdir(s3Path, { recursive: true }),
  ]);

  logger.info(
    `Ensured subfolders exist: 'modified/', 'original/', 'modified/S3/' inside ${newFolderPath}`
  );

  return newFolderPath;
}
