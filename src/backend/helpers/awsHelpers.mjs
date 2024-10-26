// src/backend/helpers/awsHelpers.mjs

import { DeleteObjectsCommand, ListObjectsCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "../awsConfigurator.mjs";
import { getId } from "../helpers/helpers.mjs";

/**
 * Deletes multiple objects from an S3 bucket.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {Array<{path: string}>} objectList - Array of objects with 'path' property to be deleted.
 * @returns {Promise<Object>} - Result of the delete operation.
 */
export async function deleteS3Objects(bucketName, objectList) {
  if (!bucketName || !Array.isArray(objectList)) {
    throw new Error(
      "Invalid input for deleteS3Objects: bucketName must be a string and objectList must be an array."
    );
  }

  if (objectList.length === 0) {
    console.warn("No objects to delete.");
    return { Deleted: [], Errors: [] }; // Return empty result if no objects
  }

  const deleteParams = {
    Bucket: bucketName,
    Delete: {
      Objects: objectList.map((item) => ({ Key: item.path })),
      Quiet: false,
    },
  };

  try {
    const data = await s3Client.send(new DeleteObjectsCommand(deleteParams));
    console.log(`Successfully deleted ${data.Deleted.length} objects`);

    if (data.Errors && data.Errors.length > 0) {
      console.error("Errors during deletion:", data.Errors);
    }

    return data;
  } catch (error) {
    console.error("Error deleting objects from S3:", error);
    throw error; // Rethrow error for further handling
  }
}

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
