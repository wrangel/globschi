// src/backend/management/bookKeeper.mjs

import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../helpers/awsHelpers.mjs";
import * as Constants from "../constants.mjs";
import { Island } from "../models/islandModel.mjs";
import { listS3BucketContents } from "../helpers/awsHelpers.mjs";
import { executeMongoQuery } from "../helpers/mongoHelpers.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

/**
 * Main function to synchronize media across S3 buckets and MongoDB
 */
async function synchronizeMedia() {
  try {
    // Fetch media from different sources
    const originalMedia = await listS3BucketContents(
      process.env.ORIGINALS_BUCKET,
      true
    );
    const actualSiteMedia = await fetchAndFilterMedia(process.env.SITE_BUCKET);
    const thumbnailSiteMedia = await fetchAndFilterMedia(
      process.env.SITE_BUCKET,
      true
    );
    const mongoDocuments = await fetchMongoDocuments();

    // Log the fetched media for debugging
    logger.info("Original Media:", originalMedia);
    logger.info("Actual Site Media:", actualSiteMedia);
    logger.info("Thumbnail Site Media:", thumbnailSiteMedia);
    logger.info("Mongo Documents:", mongoDocuments);

    // Compare media across sources
    const comparisons = compareMediaSources(
      originalMedia,
      actualSiteMedia,
      thumbnailSiteMedia,
      mongoDocuments
    );

    // Delete non-original media and documents
    await deleteNonOriginalContent(comparisons);

    // Handle media only present in originals
    await handleUniqueOriginals(comparisons);

    logger.info("Media synchronization complete.");
    logger.info(
      "If there are any media only in the originals bucket, please download them, delete them in the originals bucket and upload them again."
    );
  } catch (error) {
    console.error("Error during media synchronization:", error);
  }
}

/**
 * Fetches and filters media files from an S3 bucket
 * @param {string} bucketName - Name of the S3 bucket
 * @param {boolean} isThumbnail - Whether to fetch thumbnail media
 * @returns {Array} Filtered media files
 */
async function fetchAndFilterMedia(bucketName, isThumbnail = false) {
  const mediaFiles = await listS3BucketContents(bucketName, true);
  return mediaFiles.filter((file) =>
    isThumbnail
      ? file.path.includes(Constants.THUMBNAIL_ID)
      : !file.path.includes(Constants.THUMBNAIL_ID)
  );
}

/**
 * Fetches documents from MongoDB
 * @returns {Array} MongoDB documents
 */
async function fetchMongoDocuments() {
  const documents = await executeMongoQuery(
    () => Island.find().lean(),
    "Island"
  );
  return documents.map((doc) => ({ key: doc.name }));
}

/**
 * Compares media sources and returns differences
 * @param {Array} originalMedia - Media from originals bucket
 * @param {Array} actualSiteMedia - Actual media from site bucket
 * @param {Array} thumbnailSiteMedia - Thumbnail media from site bucket
 * @param {Array} mongoDocuments - Documents from MongoDB
 * @returns {Object} Comparison results
 */
function compareMediaSources(
  originalMedia,
  actualSiteMedia,
  thumbnailSiteMedia,
  mongoDocuments
) {
  // Ensure all inputs are arrays before proceeding
  if (
    !Array.isArray(originalMedia) ||
    !Array.isArray(actualSiteMedia) ||
    !Array.isArray(thumbnailSiteMedia) ||
    !Array.isArray(mongoDocuments)
  ) {
    throw new TypeError("All inputs must be arrays.");
  }

  return {
    actuals: compareArrays(originalMedia, actualSiteMedia),
    thumbnails: compareArrays(originalMedia, thumbnailSiteMedia),
    mongoDocs: compareArrays(originalMedia, mongoDocuments),
  };
}

/**
 * Deletes non-original content from S3 and MongoDB
 * @param {Object} comparisons - Comparison results
 */
async function deleteNonOriginalContent(comparisons) {
  const nonOriginalMedia = [
    ...comparisons.actuals.onlyInB,
    ...comparisons.thumbnails.onlyInB,
  ];

  await deleteS3Objects(process.env.SITE_BUCKET, nonOriginalMedia);

  const nonOriginalDocs = comparisons.mongoDocs.onlyInB.map((item) => item.key);
  await deleteNonOriginalDocuments(nonOriginalDocs);
}

/**
 * Handles media that is only present in the originals bucket
 * @param {Object} comparisons - Comparison results
 */
async function handleUniqueOriginals(comparisons) {
  const uniqueOriginalKeys = [
    ...comparisons.actuals.onlyInA,
    ...comparisons.thumbnails.onlyInA,
    ...comparisons.mongoDocs.onlyInA,
  ];

  const transformedDeletionPaths = uniqueOriginalKeys.flatMap((item) => [
    {
      key: item.key,
      path: item.path.replace(
        Constants.MEDIA_FORMATS.large,
        Constants.MEDIA_FORMATS.site
      ),
    },
    {
      key: item.key,
      path: `${Constants.THUMBNAIL_ID}/${item.key}${Constants.MEDIA_FORMATS.site}`,
    },
  ]);

  await deleteNonOriginalMedia(transformedDeletionPaths);
  await deleteNonOriginalDocuments(
    transformedDeletionPaths.map((item) => item.key)
  );
}

/**
 * Deletes non-original media from S3
 * @param {Array} nonOriginalMedia - Media to be deleted
 */
async function deleteNonOriginalMedia(nonOriginalMedia) {
  await deleteS3Objects(process.env.SITE_BUCKET, nonOriginalMedia);
}

/**
 * Deletes non-original documents from MongoDB
 * @param {Array} nonOriginalKeys - Keys of documents to be deleted
 */
async function deleteNonOriginalDocuments(nonOriginalKeys) {
  await executeMongoQuery(async () => {
    return await Island.deleteMany({ name: { $in: nonOriginalKeys } });
  }, "Island");
}

/**
 * Compares two arrays and returns the items that are only in one of them
 * @param {Array} A - First array
 * @param {Array} B - Second array
 * @returns {Object} Object containing items only in A and only in B
 */
function compareArrays(A, B) {
  const bKeys = new Set(B.map((item) => item.key));
  const onlyInA = A.filter((itemA) => !bKeys.has(itemA.key));

  const aKeys = new Set(A.map((item) => item.key));
  const onlyInB = B.filter((itemB) => !aKeys.has(itemB.key));

  return { onlyInA, onlyInB };
}

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

    logger.info(`Successfully deleted ${data.Deleted.length} objects`);

    if (data.Errors && data.Errors.length > 0) {
      console.error("Errors during deletion:", data.Errors);
    }

    return data;
  } catch (error) {
    console.error("Error deleting objects from S3:", error);

    throw error; // Rethrow error for further handling
  }
}

// Execute the main function
synchronizeMedia().catch(console.error);
