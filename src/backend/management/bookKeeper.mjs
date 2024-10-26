// src/backend/management/bookKeeper.mjs

import * as Constants from "../constants.mjs";
import { Island } from "../models/islandModel.mjs";
import {
  deleteS3Objects,
  listS3BucketContents,
} from "../helpers/awsHelpers.mjs";
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

    console.log("Media synchronization complete.");
    console.log(
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

// Execute the main function
synchronizeMedia().catch(console.error);
