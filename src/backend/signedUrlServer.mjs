// src/backend/signedUrlServer.mjs

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./utils/awsUtils.mjs";
import { EXPIRATION_TIME } from "./constants.mjs";
import { Island } from "./models/islandModel.mjs";
import NodeCache from "node-cache";

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
  const docs = await Island.find().select("name type").lean();

  const results = [];
  for (const { name, type } of docs) {
    const thumbnailUrl = `${BASE_URL}/${name}/thumbnail.webp`;
    const actualUrl =
      type === "pano"
        ? `${BASE_URL}/${name}/tiles`
        : await signedUrl(`${name}/${name}.webp`);

    results.push({ name, type, urls: { thumbnailUrl, actualUrl } });
  }

  return results;
}
