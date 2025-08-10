// src/backend/helpers/awsHelpers.mjs

import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import fs from "fs/promises";
import logger from "../helpers/logger.mjs";
import { getId } from "./helpers.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

// Validate required environment variables
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
 * Creates and configures an S3 client.
 * @returns {S3Client} Configured S3 client
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

// Create the S3 client
const s3Client = createS3Client();
export { s3Client };

/**
 * Lists the contents of an S3 bucket.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {boolean} [adapt=false] - Whether to adapt the response.
 * @returns {Promise<Array>} - The bucket contents or an empty array if none found.
 * @throws {Error} If there's an issue listing the bucket contents.
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
 * Downloads an object from S3 bucket.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} key - The key of the object in S3.
 * @param {string} localPath - The local path to save the downloaded file.
 * @returns {Promise<void>}
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
 * @param {Array<{Key: string}>} objects - Array of objects to delete.
 * @returns {Promise<Object>} - Deletion result.
 */
export async function deleteS3Objects(objects) {
  // Check if the bucket name is defined
  const bucketName = process.env.AWS_BUCKET_ORIGINALS;
  if (!bucketName) {
    throw new Error("Bucket name is not defined in environment variables.");
  }

  // Input validation
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

    // Log any errors for objects that were not found
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
