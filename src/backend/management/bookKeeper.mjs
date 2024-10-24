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

// Delete all media which are not present in originals
await deleteS3Objects(process.env.SITE_BUCKET, compareSiteMediaActuals.onlyInB);
await deleteS3Objects(
  process.env.SITE_BUCKET,
  compareSiteMediaThumbnails.onlyInB
);

const compareMongoDocMedia = compareArrays(originalMedia, mongoDocMedia);
console.log(compareMongoDocMedia);
const keysToDelete = compareMongoDocMedia.onlyInB.map((item) => item.key);
console.log(keysToDelete);

Island.deleteMany({ name: { $in: keysToDelete } });

process.exit(0);
