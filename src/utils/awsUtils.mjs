// src/utils/awsUtils.mjs

import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import fs from "fs/promises";
import logger from "../utils/logger.mjs";
import { getId } from "./utils.mjs";

// Validate required AWS environment variables are set
const requiredEnvVars = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_DEFAULT_REGION",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

/**
 * Creates and configures an AWS S3 client instance.
 * @returns {S3Client} Configured AWS S3 client
 */
function createS3Client() {
  return new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_DEFAULT_REGION,
    maxAttempts: 3,
  });
}

// Initialize S3 client once and export for reuse
const s3Client = createS3Client();
export { s3Client };

/**
 * Lists contents of an S3 bucket, optionally adapting response fields.
 * Handles pagination to retrieve more than maxKeys per request.
 *
 * @param {string} bucketName - Name of the S3 bucket to list.
 * @param {boolean} [adapt=false] - Whether to map response to custom key/path format.
 * @param {number} [maxKeys=1000] - Maximum number of keys per request.
 * @returns {Promise<Array>} Array of objects representing bucket contents.
 * @throws {Error} On AWS API or network errors.
 */
export async function listS3BucketContents(
  bucketName,
  adapt = false,
  maxKeys = 1000
) {
  if (typeof adapt !== "boolean") {
    throw new TypeError("adapt parameter must be a boolean");
  }

  let allContents = [];
  let continuationToken = undefined;

  do {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: maxKeys,
        ContinuationToken: continuationToken,
      });
      const response = await s3Client.send(command);

      if (response.Contents && response.Contents.length > 0) {
        allContents = allContents.concat(
          adapt
            ? response.Contents.map((file) => ({
                key: getId(file.Key),
                path: file.Key,
              }))
            : response.Contents
        );
      }

      continuationToken = response.NextContinuationToken;
    } catch (error) {
      logger.error(
        `Error listing contents of bucket ${bucketName}: ${error.message}`,
        { error }
      );
      throw error;
    }
  } while (continuationToken);

  if (allContents.length === 0) {
    logger.warn(`No contents found in bucket: ${bucketName}`);
  }

  return allContents;
}

/**
 * Downloads an object from an S3 bucket and writes it to a local file.
 *
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} key - The key of the object in the bucket to download.
 * @param {string} localPath - The local file path to save the downloaded contents.
 * @returns {Promise<void>}
 * @throws Will throw an error if download or writing file fails.
 */
export async function downloadS3Object(bucketName, key, localPath) {
  try {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const response = await s3Client.send(command);

    await fs.writeFile(localPath, response.Body);
    logger.info(`Downloaded ${key} to ${localPath}`);
  } catch (error) {
    logger.error(
      `Error downloading object ${key} from bucket ${bucketName}: ${error.message}`,
      { error }
    );
    throw error;
  }
}

/**
 * Deletes multiple objects from S3 bucket.
 *
 * @param {Array<{Key: string}>} objects - Array of objects to delete, each item must have a Key property.
 * @returns {Promise<Object>} AWS deletion result object.
 * @throws Will throw an error if deletion fails or input is invalid.
 */
export async function deleteS3Objects(objects) {
  // Check if original bucket name is defined
  const bucketName = process.env.AWS_BUCKET_ORIGINALS;
  if (!bucketName) {
    throw new Error("Bucket name is not defined in environment variables.");
  }

  // Validate input array
  if (!Array.isArray(objects) || objects.length === 0) {
    throw new Error("Invalid input: objects must be a non-empty array.");
  }

  try {
    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: { Objects: objects },
    });

    const result = await s3Client.send(command);

    logger.info(`Deleted ${result.Deleted.length} objects from ${bucketName}`);

    // Log errors for objects that weren't deleted successfully
    if (result.Errors && result.Errors.length > 0) {
      result.Errors.forEach((error) => {
        logger.warn(`Failed to delete object ${error.Key}: ${error.Message}`);
      });
    }

    return result;
  } catch (error) {
    logger.error(
      `Error deleting objects from bucket ${bucketName}: ${error.message}`,
      { error }
    );

    throw error;
  }
}
