// src/backend/signedUrlServer.mjs

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { listS3BucketContents } from "./helpers/awsHelpers.mjs";
import { s3Client } from "./helpers/awsHelpers.mjs";
import { ACTUAL_ID, THUMBNAIL_ID, EXPIRATION_TIME } from "./constants.mjs";
import { getId } from "./helpers/helpers.mjs";

const validCubeFaces = ["front", "back", "left", "right", "top", "bottom"];

/**
 * Generates signed URLs for S3 objects.
 * Returns an array; if a folder contains all cube faces, entry has isCubePano/faceUrls, else legacy format.
 */
export async function getUrls() {
  try {
    const bucketContents = await listS3BucketContents(process.env.AWS_BUCKET_SITE);

    // Group contents by folder (second path segment)
    const groupedByFolder = groupContentsByFolder(bucketContents);

    const results = [];

    for (const [folder, contents] of Object.entries(groupedByFolder)) {
      // Detect cube pano folder: all six cube faces in pan/<folder>/<face>.webp
      const cubeFaceFiles = validCubeFaces.map(face => `pan/${folder}/${face}.webp`);
      const isCubePano = cubeFaceFiles.every(fileKey =>
        contents.some(c => c.Key === fileKey)
      );

      if (isCubePano) {
        // Cube pano: signed URLs for each face
        const faceUrls = {};
        for (const face of validCubeFaces) {
          const key = `pan/${folder}/${face}.webp`;
          faceUrls[face] = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
              Bucket: process.env.AWS_BUCKET_SITE,
              Key: key,
            }),
            { expiresIn: EXPIRATION_TIME }
          );
        }
        results.push({
          name: folder,
          isCubePano: true,
          faceUrls,
        });
      } else if (contents.length > 0) {
        // Legacy: file grouping just like before using existing helpers
        const signedUrls = await generateSignedUrls(contents);
        const groupedUrls = groupUrlsById(signedUrls);   // unchanged helper
        const sortedUrls = sortUrlsByType(groupedUrls);  // unchanged helper
        const formattedUrls = formatUrls(sortedUrls);     // unchanged helper
        results.push(...formattedUrls);
      }
    }
    return results;
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
 * Groups S3 objects by folder name (second path segment in key).
 */
function groupContentsByFolder(contents) {
  return contents.reduce((acc, content) => {
    const parts = content.Key.split("/");
    const folder = parts.length > 1 ? parts[1] : "";
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(content);
    return acc;
  }, {});
}

/**
 * Groups URLs by their ID.
 */
function groupUrlsById(urls) {
  return urls.reduce((acc, url) => {
    const found = acc.find((a) => a.id === url.id);
    if (!found) {
      acc.push({ id: url.id,  [{ type: url.type, sigUrl: url.sigUrl }] });
    } else {
      found.data.push({ type: url.type, sigUrl: url.sigUrl });
    }
    return acc;
  }, []);
}

/**
 * Sorts URLs based on type (actual first, thumbnail second).
 */
function sortUrlsByType(groupedUrls) {
  return groupedUrls.map((item) => ({
    ...item,
     item.data.sort((a, b) => a.type.localeCompare(b.type)), 
  }));
}

/**
 * Formats the URLs into the final structure.
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
