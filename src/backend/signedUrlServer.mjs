// src/backend/signedUrlServer.mjs

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./utils/awsUtils.mjs";
import { EXPIRATION_TIME, MEDIA_PAGES } from "./constants.mjs";
import { Island } from "./models/islandModel.mjs";
import NodeCache from "node-cache";
import util from "util"; /////

const BUCKET = process.env.AWS_BUCKET;
const REGION = process.env.AWS_DEFAULT_REGION;
const BASE_URL = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

const urlCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

async function signedUrl(key) {
  if (urlCache.has(key)) {
    return urlCache.get(key);
  }

  const fresh = await getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: EXPIRATION_TIME }
  );

  urlCache.set(key, fresh);
  return fresh;
}

export async function getUrls() {
  const docs = await Island.find({ s3Folder: { $exists: true } })
    .select("name type s3Folder")
    .lean();

  const results = [];
  for (const { name, type, s3Folder } of docs) {
    const thumbnailUrl = `${BASE_URL}/${s3Folder}/thumbnail.webp`;
    const actualUrl =
      type === MEDIA_PAGES.find((v) => v === "pan")
        ? `${BASE_URL}/${s3Folder}/tiles`
        : await signedUrl(`${s3Folder}/${s3Folder}.webp`);

    results.push({ name, type, urls: { thumbnailUrl, actualUrl } });
  }

  return results;
}
