// TODO Improve

// src/backend/management/bookKeeper.mjs

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../awsConfigurator.mjs";
import * as Constants from "../constants.mjs";
import { Island } from "../models/islandModel.mjs";
import { listBucketContents } from "../helpers/awsHelpers.mjs";
import { executeMongoQuery } from "../helpers/mongoHelpers.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

// Get Original media
const originalMedia = await listBucketContents(
  process.env.ORIGINALS_BUCKET,
  true
);

const siteMedia = await listBucketContents(process.env.SITE_BUCKET, true);

// Get actual image Site files
const actualSiteMedia = siteMedia.filter(
  (siteMedium) => siteMedium.path.indexOf(Constants.THUMBNAIL_ID) == -1
);

// Get thumbnail image Site files
const thumbnailSiteMedia = siteMedia.filter(
  (siteMedium) => siteMedium.path.indexOf(Constants.THUMBNAIL_ID) > -1
);

// Get the Mongo DB docs
const mongoDocs = await executeMongoQuery(async () => {
  return await Island.find().lean();
}, "Island");

const mongoDocMedia = mongoDocs.map((doc) => doc.name);

console.log(mongoDocMedia);
process.exit(0);
