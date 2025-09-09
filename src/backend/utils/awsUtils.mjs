// src/utils/awsUtils.mjs

import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import fsExtra from "fs-extra";
import logger from "../utils/logger.mjs";

// Validate all required AWS environment variables on module load
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
 * Creates and configures a reusable AWS S3 client using credentials and region from environment.
 *
 * @returns {S3Client} An instance of AWS S3 client preconfigured with retry options.
 */
function createS3Client() {
  return new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_DEFAULT_REGION,
    maxAttempts: 3, // Retry attempts on failures
  });
}

// Single instance S3 client to be reused across requests
const s3Client = createS3Client();
export { s3Client };

/**
 * Lists all contents in the specified S3 bucket, handling pagination.
 * Optionally adapts response to a simplified format with key and path.
 *
 * @param {string} bucketName - The S3 bucket name to list contents from.
 * @param {boolean} [adapt=false] - If true, maps results to objects with keys 'key' and 'path'.
 * @param {number} [maxKeys=1000] - Maximum number of keys to fetch per request (up to AWS limit).
 * @returns {Promise<Array<Object>>} Array of bucket contents, each as full AWS S3 list object or adapted keys.
 * @throws {Error} If AWS API call fails or input parameters are invalid.
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

  // Loop over paginated results until complete listing
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
 * Downloads an object from the specified S3 bucket and writes it directly to the local file system.
 * Supports streaming response to file efficiently.
 *
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} key - The key (path) of the object in the bucket.
 * @param {string} localPath - The local filesystem path to write the downloaded object.
 * @returns {Promise<void>}
 * @throws Will throw if the download or file write fails.
 */
export async function downloadS3Object(bucketName, key, localPath) {
  try {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    const response = await s3Client.send(command);

    if (response.Body?.pipe) {
      // Stream S3 object directly to file
      const writable = fsExtra.createWriteStream(localPath);
      await new Promise((resolve, reject) => {
        response.Body.pipe(writable);
        writable.on("finish", resolve);
        writable.on("error", reject);
      });
    } else {
      // Fallback for non-stream body (e.g. Buffer)
      await fsExtra.writeFile(localPath, response.Body);
    }

    logger.info(`Downloaded S3 object ${key} to local path ${localPath}`);
  } catch (error) {
    logger.error(
      `Failed to download S3 object '${key}' from bucket '${bucketName}': ${error.message}`,
      { error }
    );
    throw error;
  }
}

/**
 * Deletes multiple objects from a configured S3 bucket in a single batch operation.
 *
 * @param {Array<{Key: string}>} objects - Array of objects to delete; each must contain a 'Key' property.
 * @returns {Promise<Object>} Result object from AWS DeleteObjects operation detailing deleted and failed objects.
 * @throws Will throw if deletion fails or input objects array is invalid.
 */
export async function deleteS3Objects(objects) {
  const bucketName = process.env.AWS_BUCKET_ORIGINALS;
  if (!bucketName) {
    throw new Error("Bucket name is not defined in environment variables.");
  }

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

/**
 * Extracts the ID (filename without extension) from a file path.
 *
 * Given a file path, returns the substring between the last slash (/) and the last dot (.),
 * effectively extracting just the filename without its extension.
 *
 * @param {string} path - Full file path or filename with extension.
 * @returns {string} Extracted ID (filename without extension).
 *
 * @example
 * getId('/path/to/file/12345.webp'); // returns '12345'
 */
export const getId = (path) =>
  path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
