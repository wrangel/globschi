// src/backend/helpers/awsHelpers.mjs

import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../awsConfigurator.mjs";
import { getId } from "../helpers/helpers.mjs";

/**
 * Lists the contents of an S3 bucket.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {boolean} [adapt=false] - Whether to adapt the response.
 * @returns {Promise<Array>} - The bucket contents.
 * @throws {Error} If there's an issue listing the bucket contents.
 */
export async function listBucketContents(bucketName, adapt = false) {
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

    if (adapt) {
      // Adapt: true - Transform the response
      return response.Contents.map((file) => {
        const path = file.Key;
        return { key: getId(path), path };
      });
    } else {
      // Adapt: false - Return the raw response
      return response.Contents;
    }
  } catch (error) {
    console.error(`Error listing contents of bucket ${bucketName}:`, error);
    throw error;
  }
}
