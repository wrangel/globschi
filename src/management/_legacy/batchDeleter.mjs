import fs from "fs/promises";
import path from "path";
import readline from "readline";
import chardet from "chardet";
import iconv from "iconv-lite";
import { deleteS3Objects, downloadS3Object } from "../utils/awsUtils.mjs";
import logger from "../utils/logger.mjs";

const DELETE_LIST_FILE = path.join(
  process.cwd(),
  "Material",
  "deleteObjects.txt"
);
const DOWNLOAD_DIRECTORY = process.env.DOWNLOAD_DIRECTORY;

/**
 * Reads and parses the delete list file.
 * @returns {Promise<Array<{Key: string}>>} An array of objects to delete.
 * @throws {Error} If there's an error reading or parsing the file.
 */
async function readDeleteList() {
  try {
    const buffer = await fs.readFile(DELETE_LIST_FILE);
    const detectedEncoding = chardet.detect(buffer);

    logger.info(`Detected file encoding: ${detectedEncoding}`);

    let data =
      detectedEncoding === "ISO-8859-1"
        ? iconv.decode(buffer, "ISO-8859-1")
        : buffer.toString(detectedEncoding);

    logger.info(`Raw file contents:\n${data}`);

    const lines = data.split("\n");
    logger.info(`Number of lines: ${lines.length}`);

    const objectsToDelete = lines
      .map((line) => {
        const trimmed = line.replace(/\/\/.*$/, "").trim();
        logger.info(`Processed line: "${trimmed}"`);
        return trimmed;
      })
      .filter((line) => {
        const valid = line && line.endsWith(".tif");
        logger.info(`Line "${line}" is ${valid ? "valid" : "invalid"}`);
        return valid;
      })
      .map((line) => line.replace(/^['"]|['"]$/g, ""))
      .map((key) => ({ Key: key }));

    logger.info(`Number of valid objects: ${objectsToDelete.length}`);

    if (objectsToDelete.length === 0) {
      throw new Error("No valid entries found in the file");
    }

    return objectsToDelete;
  } catch (error) {
    logger.error(`Error in readDeleteList: ${error.message}`);
    throw new Error(`Error reading or parsing file: ${error.message}`);
  }
}

/**
 * Prompts for user confirmation before deletion.
 * @returns {Promise<boolean>} True if user confirms, false otherwise.
 */
async function confirmDeletion() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "Are you sure you want to delete these objects? (yes/no): ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "yes");
      }
    );
  });
}

/**
 * Checks if a file exists at the given path.
 * @param {string} filePath - The path to check.
 * @returns {Promise<boolean>} True if the file exists, false otherwise.
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Downloads images from S3 to the local directory.
 * @param {Array<{Key: string}>} objectsToDelete - Array of objects to download.
 */
async function downloadImages(objectsToDelete) {
  for (const { Key } of objectsToDelete) {
    const fileName = path.basename(Key);
    const localPath = path.join(DOWNLOAD_DIRECTORY, fileName);

    const exists = await fileExists(localPath);
    if (!exists) {
      logger.info(`Downloading ${fileName}...`);
      await downloadS3Object(process.env.AWS_BUCKET_ORIGINALS, Key, localPath);
    } else {
      logger.info(`${fileName} already downloaded.`);
    }
  }
}

/**
 * Main function to execute the deletion process.
 */
async function main() {
  if (!DOWNLOAD_DIRECTORY) {
    logger.error("DOWNLOAD_DIRECTORY environment variable is not set.");
    return;
  }

  try {
    const objectsToDelete = await readDeleteList();
    logger.info(`Found ${objectsToDelete.length} objects to delete.`);

    await downloadImages(objectsToDelete);

    const confirmed = await confirmDeletion();
    if (!confirmed) {
      logger.info("Deletion cancelled.");
      return;
    }

    const result = await deleteS3Objects(objectsToDelete);
    logger.info("Deletion result:", result);
  } catch (error) {
    logger.error("Error in main process:", error);
  }
}

// Execute the main function
main();
