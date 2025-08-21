// src/backend/signedUrlServer.mjs

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
 * Legacy single-file panoramas are kept only when the six-face folder
 * (same panorama id) does NOT exist.
 * @returns {Promise<Array>} Array of objects with name and URLs.
 */
export async function getUrls() {
  try {
    const bucketContents = await listS3BucketContents(
      process.env.AWS_BUCKET_SITE
    );

    /* ----------------------------------------------------------
       1.  Determine which panorama ids have a complete cubemap set
    ---------------------------------------------------------- */
    const cubemapIds = new Set();
    for (const content of bucketContents) {
      const key = content.Key;
      const parts = key.split("/");
      if (
        parts.length >= 3 &&
        CUBEMAP_FACES.some((face) => key.endsWith(`/${face}`))
      ) {
        cubemapIds.add(parts[parts.length - 2]); // panorama id (folder name)
      }
    }

    /* ----------------------------------------------------------
       2.  Split files into cubemap vs. legacy/other
    ---------------------------------------------------------- */
    const cubemapItems = [];
    const legacyItems = [];

    for (const content of bucketContents) {
      const key = content.Key;

      // --- Cubemap face file ---
      if (CUBEMAP_FACES.some((face) => key.endsWith(`/${face}`))) {
        cubemapItems.push(content);
        continue;
      }

      // --- Legacy single-file panorama (root level) ---
      if (key.endsWith(".webp") && key.split("/").length === 2) {
        const id = getId(key);
        // keep it only if the six-face folder does NOT exist
        if (!cubemapIds.has(id)) {
          legacyItems.push(content);
        }
        continue;
      }

      // --- Anything else (thumbnails, etc.) ---
      legacyItems.push(content);
    }

    /* ----------------------------------------------------------
       3.  Generate signed URLs
    ---------------------------------------------------------- */
    const cubemapUrls = await generateCubemapSignedUrls(cubemapItems);
    const legacySignedUrls = await generateSignedUrls(legacyItems);

    /* ----------------------------------------------------------
       4.  Format legacy items
    ---------------------------------------------------------- */
    const groupedUrls = groupUrlsById(legacySignedUrls);
    const sortedUrls = sortUrlsByType(groupedUrls);
    const formattedUrls = formatUrls(sortedUrls);

    /* ----------------------------------------------------------
       5.  Combine & return
    ---------------------------------------------------------- */
    return [...formattedUrls, ...cubemapUrls];
  } catch (error) {
    throw new Error("Failed to generate signed URLs");
  }
}

/* ==================================================================
   Helper functions (unchanged except for comments)
================================================================== */

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

async function generateCubemapSignedUrls(contents) {
  const panoMap = new Map();

  for (const content of contents) {
    const key = content.Key;
    const parts = key.split("/");
    const face = parts[parts.length - 1];
    const panoId = parts[parts.length - 2];

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

function sortUrlsByType(groupedUrls) {
  return groupedUrls.map((item) => ({
    ...item,
    data: item.data.sort((a, b) => a.type.localeCompare(b.type)),
  }));
}

function formatUrls(sortedUrls) {
  return sortedUrls.map((elem) => ({
    name: elem.id,
    urls: {
      actual: elem.data.find((d) => d.type === ACTUAL_ID)?.sigUrl,
      thumbnail: elem.data.find((d) => d.type === THUMBNAIL_ID)?.sigUrl,
    },
  }));
}
