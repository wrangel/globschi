// src/backend/management/handleFolder.mjs

import fs from "fs/promises";
import path from "path";
import logger from "../utils/logger.mjs";

/**
 * Rename a folder to the new name.
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

  return newFolderPath;
}
