// src/backend/helpers/awsHelpers.mjs

import { S3Client } from "@aws-sdk/client-s3";
import { ListObjectsCommand } from "@aws-sdk/client-s3";
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
    maxAttempts: 3, // Optional: Add custom retry strategy
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
export async function listS3BucketContents(bucketName, adapt = false) {
  if (typeof adapt !== "boolean") {
    throw new TypeError("adapt parameter must be a boolean");
  }

  try {
    const command = new ListObjectsCommand({ Bucket: bucketName });
    const response = await s3Client.send(command);

    if (!response?.Contents?.length) {
      logger.warn(`No contents found in bucket: ${bucketName}`);
      return [];
    }

    return adapt
      ? response.Contents.map((file) => ({
          key: getId(file.Key),
          path: file.Key,
        }))
      : response.Contents; // Return raw response if not adapting
  } catch (error) {
    logger.error(
      `Error listing contents of bucket ${bucketName}: ${error.message}`,
      { error }
    );
    throw error;
  }
}
