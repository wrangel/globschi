// src/backend/batchDeleter.mjs

import { processS3Objects } from "../helpers/awsHelpers.mjs";
import logger from "../helpers/logger.mjs";

/**
 * Manages the processing of S3 objects by coordinating downloads and deletions.
 *
 * This function initiates the process of downloading and deleting specified objects
 * from an S3 bucket. It logs the start and successful completion of the process,
 * as well as any errors that occur during execution.
 *
 * @param {string} bucketName - The name of the S3 bucket from which to manage objects.
 * @param {Array<{root_folder: string, object: string}>} objectsList - An array of objects to process,
 *        where each object contains:
 *        - `root_folder`: The folder in the S3 bucket where the object is located.
 *        - `object`: The name of the object (with file type suffix).
 *
 * @returns {Promise<void>} A promise that resolves when the processing is complete.
 *
 * @throws {Error} Throws an error if there is an issue during the processing of S3 objects,
 *         which will be logged for debugging purposes.
 */
export async function manageS3Objects(bucketName, objectsList) {
  try {
    logger.info(`Starting S3 object management for bucket: ${bucketName}`);
    await processS3Objects(bucketName, objectsList); // No need to pass fileType
    logger.info("S3 objects processed successfully");
  } catch (error) {
    logger.error("Error processing S3 objects:", error);
    throw error;
  }
}
