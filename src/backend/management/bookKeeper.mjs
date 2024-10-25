// src/backend/management/bookKeeper.mjs

import * as Constants from "../constants.mjs";
import { Island } from "../models/islandModel.mjs";
import { deleteS3Objects, listBucketContents } from "../helpers/awsHelpers.mjs";
import { compareArrays } from "../helpers/helpers.mjs";
import { executeMongoQuery } from "../helpers/mongoHelpers.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

// Function to fetch and filter media files
async function fetchAndFilterMedia(bucketName, isThumbnail = false) {
  const mediaFiles = await listBucketContents(bucketName, true);
  return mediaFiles.filter((file) =>
    isThumbnail
      ? file.path.includes(Constants.THUMBNAIL_ID)
      : !file.path.includes(Constants.THUMBNAIL_ID)
  );
}

// Function to delete non-original media from S3
async function deleteNonOriginalMedia(nonOriginalMedia) {
  await deleteS3Objects(process.env.SITE_BUCKET, nonOriginalMedia);
}

// Function to delete non-original documents from MongoDB
async function deleteNonOriginalDocuments(nonOriginalKeys) {
  await executeMongoQuery(async () => {
    return await Island.deleteMany({ name: { $in: nonOriginalKeys } });
  }, "Island");
}

// Fetch original and site media
const originalMedia = await listBucketContents(
  process.env.ORIGINALS_BUCKET,
  true
);
const actualSiteMedia = await fetchAndFilterMedia(process.env.SITE_BUCKET);
const thumbnailSiteMedia = await fetchAndFilterMedia(
  process.env.SITE_BUCKET,
  true
);

// Fetch MongoDB documents
const mongoDocuments = await executeMongoQuery(
  () => Island.find().lean(),
  "Island"
);
const mongoDocMedia = mongoDocuments.map((doc) => ({ key: doc.name }));

// Compare originals with site media and MongoDB documents
const actualsComparison = compareArrays(originalMedia, actualSiteMedia);
const thumbnailsComparison = compareArrays(originalMedia, thumbnailSiteMedia);
const mongoDocsComparison = compareArrays(originalMedia, mongoDocMedia);

// Delete site media not present in originals
await deleteNonOriginalMedia(
  actualsComparison.onlyInB.concat(thumbnailsComparison.onlyInB)
);

// Delete MongoDB documents not present in originals
await deleteNonOriginalDocuments(
  mongoDocsComparison.onlyInB.map((item) => item.key)
);

// Collect all keys only present in originals for deletion
const uniqueOriginalKeys = [
  ...actualsComparison.onlyInA,
  ...thumbnailsComparison.onlyInA,
  ...mongoDocsComparison.onlyInA,
];

// Transform keys for deletion paths
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

// Delete exhaustive list of all elements missing anywhere in non-originals
await deleteNonOriginalMedia(transformedDeletionPaths);
await deleteNonOriginalDocuments(
  transformedDeletionPaths.map((item) => item.key)
);

console.log(actualsComparison);
