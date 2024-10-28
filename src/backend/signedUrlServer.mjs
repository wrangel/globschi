// src/backend/signedUrlServer.mjs

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { listS3BucketContents } from "./helpers/awsHelpers.mjs";
import { s3Client } from "./helpers/awsHelpers.mjs";
import { ACTUAL_ID, THUMBNAIL_ID, EXPIRATION_TIME } from "./constants.mjs";
import { loadEnv } from "./loadEnv.mjs";
import { getId } from "./helpers/helpers.mjs";

loadEnv();

/**
 * Generates signed URLs for S3 objects.
 * @returns {Promise<Array>} Array of objects with name and URLs.
 */
export async function getUrls() {
  try {
    const bucketContents = await listS3BucketContents(process.env.SITE_BUCKET);
    const signedUrls = await generateSignedUrls(bucketContents);
    const groupedUrls = groupUrlsById(signedUrls);
    const sortedUrls = sortUrlsByType(groupedUrls);
    console.log(formatUrls(sortedUrls));
    return formatUrls(sortedUrls);
  } catch (error) {
    throw new Error("Failed to generate signed URLs");
  }
}

/**
 * Generates signed URLs for each object in the bucket.
 * @param {Array} contents - Bucket contents.
 * @returns {Promise<Array>} Array of objects with id, type, and signed URL.
 */
async function generateSignedUrls(contents) {
  return Promise.all(
    contents.map(async (content) => {
      const key = content.Key;
      const type = key.startsWith(THUMBNAIL_ID) ? THUMBNAIL_ID : ACTUAL_ID;
      return {
        id: getId(key),
        type,
        sigUrl: await getSignedUrl(
          s3Client,
          new GetObjectCommand({ Bucket: process.env.SITE_BUCKET, Key: key }),
          { expiresIn: EXPIRATION_TIME }
        ),
      };
    })
  );
}

/**
 * Groups URLs by their ID.
 * @param {Array} urls - Array of URL objects.
 * @returns {Array} Grouped URL objects.
 */
function groupUrlsById(urls) {
  return urls.reduce((acc, url) => {
    const found = acc.find((a) => a.id === url.id);
    if (!found) {
      acc.push({ id: url.id, data: [{ type: url.type, sigUrl: url.sigUrl }] });
    } else {
      found.data.push({ type: url.type, sigUrl: url.sigUrl });
    }
    return acc;
  }, []);
}

/**
 * Sorts URLs based on type (actual first, thumbnail second).
 * @param {Array} groupedUrls - Grouped URL objects.
 * @returns {Array} Sorted URL objects.
 */
function sortUrlsByType(groupedUrls) {
  return groupedUrls.map((item) => ({
    ...item,
    data: item.data.sort((a, b) => a.type.localeCompare(b.type)),
  }));
}

/**
 * Formats the URLs into the final structure.
 * @param {Array} sortedUrls - Sorted URL objects.
 * @returns {Array} Formatted URL objects.
 */
function formatUrls(sortedUrls) {
  return sortedUrls.map((elem) => ({
    name: elem.id,
    urls: {
      actual: elem.data.find((d) => d.type === ACTUAL_ID)?.sigUrl,
      thumbnail: elem.data.find((d) => d.type === THUMBNAIL_ID)?.sigUrl,
    },
  }));
}
