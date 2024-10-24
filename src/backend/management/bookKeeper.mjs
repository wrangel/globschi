// TODO Improve

// src/backend/management/bookKeeper.mjs

import * as Constants from "../constants.mjs";
import { Island } from "../models/islandModel.mjs";
import { deleteS3Objects, listBucketContents } from "../helpers/awsHelpers.mjs";
import { compareArrays } from "../helpers/helpers.mjs";
import { executeMongoQuery } from "../helpers/mongoHelpers.mjs";

import { loadEnv } from "../loadEnv.mjs";

loadEnv();

// a) Get original media (master media)
const originalMedia = await listBucketContents(
  process.env.ORIGINALS_BUCKET,
  true
);

const siteMedia = await listBucketContents(process.env.SITE_BUCKET, true);

// b) Get actual image Site files
const siteMediaActuals = siteMedia.filter(
  (siteMedium) => siteMedium.path.indexOf(Constants.THUMBNAIL_ID) == -1
);

// c) Get thumbnail image Site files
const siteMediaThumbnails = siteMedia.filter(
  (siteMedium) => siteMedium.path.indexOf(Constants.THUMBNAIL_ID) > -1
);

// d) Get the Mongo DB docs
const mongoDocs = await executeMongoQuery(async () => {
  return await Island.find().lean();
}, "Island");

const mongoDocMedia = mongoDocs.map((doc) => ({ key: doc.name }));

/////

// Compare originals with non-originals
const compareSiteMediaActuals = compareArrays(originalMedia, siteMediaActuals);
const compareSiteMediaThumbnails = compareArrays(
  originalMedia,
  siteMediaThumbnails
);
const compareMongoDocMedia = compareArrays(originalMedia, mongoDocMedia);

//////

// Delete all site media which are not present in originals
await deleteS3Objects(
  process.env.SITE_BUCKET,
  compareSiteMediaActuals.onlyInB.concat(compareSiteMediaThumbnails.onlyInB)
);

// Delete all mongo documents which are not present in originals
const keysToDelete = compareMongoDocMedia.onlyInB.map((item) => item.key);
await executeMongoQuery(async () => {
  return await Island.deleteMany({ name: { $in: keysToDelete } });
}, "Island");

//////

// Delete exhaustive list of all elements missing anywhere in non-originals

// Collect all the keys which are only in the originals
const originalArray = [
  ...compareSiteMediaActuals.onlyInA,
  ...compareSiteMediaThumbnails.onlyInA,
  ...compareMongoDocMedia.onlyInA,
];

console.log(originalArray);

const transformedArray = originalArray.flatMap((item) => [
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

// Create an array of keys
const keysToDelete2 = transformedArray.map((item) => item.key);

// Delete all media which are not present in originals (anywhere)
await deleteS3Objects(process.env.SITE_BUCKET, transformedArray);
await executeMongoQuery(async () => {
  return await Island.deleteMany({ name: { $in: keysToDelete2 } });
}, "Island");
