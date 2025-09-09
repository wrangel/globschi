// src/backend/management/uploader/handleFolder.mjs

import fs from "fs/promises";
import path from "path";
import logger from "../../utils/logger.mjs";
import {
  MODIFIED_FOLDER,
  ORIGINAL_FOLDER,
  S3_FOLDER,
} from "../../constants.mjs";

/**
 * Rename a folder to a new name if different,
 * then ensure subfolders "modified", "original", and "modified/S3" exist.
 *
 * @param {string} originalFolderPath - Full path of folder to rename.
 * @param {string} newName - Target folder name.
 * @returns {Promise<string>} The new folder path.
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
      `No rename needed: '${originalFolderPath}' already named '${newName}'`
    );
  }

  // Compose subfolder paths using constants
  const modifiedPath = path.join(newFolderPath, MODIFIED_FOLDER);
  const originalPath = path.join(newFolderPath, ORIGINAL_FOLDER);
  const s3Path = path.join(modifiedPath, S3_FOLDER);

  // Create subfolders if missing, recursively
  await Promise.all([
    fs.mkdir(modifiedPath, { recursive: true }),
    fs.mkdir(originalPath, { recursive: true }),
    fs.mkdir(s3Path, { recursive: true }),
  ]);

  logger.info(
    `Ensured subfolders exist: '${MODIFIED_FOLDER}/', '${ORIGINAL_FOLDER}/', '${MODIFIED_FOLDER}/${S3_FOLDER}/' inside ${newFolderPath}`
  );

  return newFolderPath;
}
