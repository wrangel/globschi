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

function compareArrays(A, B) {
  const onlyInA = A.filter(
    (itemA) => !B.some((itemB) => itemB.key === itemA.key)
  );

  const onlyInB = B.filter(
    (itemB) => !A.some((itemA) => itemA.key === itemB.key)
  );

  return {
    onlyInA,
    onlyInB,
  };
}

// Compare originals with non-originals
const compareAB = compareArrays(originalMedia, siteMediaActuals);
const compareAC = compareArrays(originalMedia, siteMediaThumbnails);

compareAB.onlyInB;
compareAC.onlyInB;

process.exit(0);

const compareAD = compareArrays(originalMedia, mongoDocMedia);
