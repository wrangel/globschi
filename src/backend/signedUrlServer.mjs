// src/backend/signedUrlServer.mjs

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { listS3BucketContents } from "./helpers/awsHelpers.mjs";
import { s3Client } from "./helpers/awsHelpers.mjs";
import { ACTUAL_ID, THUMBNAIL_ID, EXPIRATION_TIME } from "./constants.mjs";
import { getId } from "./helpers/helpers.mjs";

const CUBEMAP_FACES = [
  "front.webp",
  "back.webp",
  "left.webp",
  "right.webp",
  "top.webp",
  "bottom.webp",
];

/**
 * Generates signed URLs for S3 objects, with cubemap pano face grouping.
 * @returns {Promise<Array>} Array of objects with name and URLs.
 */
export async function getUrls() {
  try {
    const bucketContents = await listS3BucketContents(
      process.env.AWS_BUCKET_SITE
    );

    // Separate cubemap face files and others
    const cubemapItems = [];
    const otherItems = [];

    for (const content of bucketContents) {
      const key = content.Key;
      if (CUBEMAP_FACES.some((face) => key.endsWith(`/${face}`))) {
        cubemapItems.push(content);
      } else {
        otherItems.push(content);
      }
    }

    // Generate signed URLs for cubemap faces grouped by pano id (folder)
    const cubemapUrls = await generateCubemapSignedUrls(cubemapItems);

    // Generate signed URLs for other files (legacy + thumbnails) as before
    const otherSignedUrls = await generateSignedUrls(otherItems);
    const groupedUrls = groupUrlsById(otherSignedUrls);
    const sortedUrls = sortUrlsByType(groupedUrls);
    const formattedUrls = formatUrls(sortedUrls);

    // Combine cubemap pano URLs with legacy URLs
    return [...formattedUrls, ...cubemapUrls];
  } catch (error) {
    throw new Error("Failed to generate signed URLs");
  }
}

/**
 * Generates signed URLs for legacy and other files.
 * @param {Array} contents
 * @returns {Promise<Array>}
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
          new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_SITE,
            Key: key,
          }),
          { expiresIn: EXPIRATION_TIME }
        ),
      };
    })
  );
}

/**
 * Generates signed URLs grouped by pano id for cubemap faces.
 * @param {Array} contents
 * @returns {Promise<Array>} - Cubemap pano objects with 6 face URLs.
 */
async function generateCubemapSignedUrls(contents) {
  const panoMap = new Map();

  for (const content of contents) {
    const key = content.Key;
    const parts = key.split("/");
    const face = parts[parts.length - 1]; // e.g., front.webp
    const panoId = parts[parts.length - 2]; // e.g., pano1

    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_SITE,
        Key: key,
      }),
      { expiresIn: EXPIRATION_TIME }
    );

    if (!panoMap.has(panoId)) panoMap.set(panoId, {});
    panoMap.get(panoId)[face.replace(".webp", "")] = signedUrl;
  }

  return Array.from(panoMap.entries()).map(([name, urls]) => ({
    name,
    urls,
  }));
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
