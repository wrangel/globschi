// src/backend/helpers/awsHelpers.mjs

import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { getId } from "./helpers.mjs";
import { s3Client } from "../awsConfigurator.mjs";

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
      console.log(`No contents found in bucket: ${bucketName}`);
      return [];
    }

    return adapt
      ? response.Contents.map((file) => ({
          key: getId(file.Key),
          path: file.Key,
        }))
      : response.Contents; // Return raw response if not adapting
  } catch (error) {
    console.error(`Error listing contents of bucket ${bucketName}:`, error);
    throw error;
  }
}
