// src/backend/helpers/awsHelpers.mjs

import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import logger from "../helpers/logger.mjs";
import { getId } from "./helpers.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

// Validate required environment variables
const requiredEnvVars = ["ACCESS_KEY", "SECRET_ACCESS_KEY", "BUCKET_REGION"];
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
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION,
    maxAttempts: 3,
    //useAccelerateEndpoint: true, // Add this line to enable S3 Transfer Acceleration
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
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {Array<{Key: string}>} objects - Array of objects to delete.
 * @returns {Promise<Object>} - Deletion result.
 */
export async function deleteS3Objects(bucketName, objects) {
  try {
    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: { Objects: objects },
    });
    const result = await s3Client.send(command);
    logger.info(`Deleted ${result.Deleted.length} objects from ${bucketName}`);
    return result;
  } catch (error) {
    logger.error(
      `Error deleting objects from bucket ${bucketName}: ${error.message}`,
      { error }
    );
    throw error;
  }
}

/**
 * Processes (downloads and deletes) objects from S3.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {Array<{root_folder: string, object: string}>} objectsList - List of objects to process.
 * @returns {Promise<void>}
 */
export async function processS3Objects(bucketName, objectsList) {
  const downloadPromises = objectsList.map((item) => {
    const key = `${item.root_folder}/${item.object}`;
    const localPath = path.join(process.cwd(), item.object);
    return downloadS3Object(bucketName, key, localPath);
  });

  await Promise.all(downloadPromises);

  const deleteObjects = objectsList.map((item) => ({
    Key: `${item.root_folder}/${item.object}`,
  }));
  await deleteS3Objects(bucketName, deleteObjects);
}
