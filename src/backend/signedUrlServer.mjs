// src/backend/signedUrlServer.mjs

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { listS3BucketContents, s3Client } from "../utils/awsUtils.mjs";
import { EXPIRATION_TIME } from "./constants.mjs";

/**
 * Retrieves signed URLs and metadata for all top-level folders in the S3 bucket.
 *
 * Groups objects by their top-level folder, detects panorama tiles presence,
 * generates signed URLs for thumbnails and actual images or panoramas.
 *
 * @returns {Promise<Array<{name: string, type: string, urls: object}>>} Array of objects with folder names, types, and signed URLs.
 * @throws Will throw an error if fetching bucket contents or signing URLs fails.
 */
export async function getUrls() {
  try {
    // List all objects in the configured S3 bucket
    const objects = await listS3BucketContents(process.env.AWS_BUCKET);

    // Group objects by their top-level folder name
    const folders = new Map();

    for (const { Key } of objects) {
      const parts = Key.split("/");
      if (parts.length < 2) continue; // Ignore root-level or malformed keys

      const folder = parts[0];
      const file = parts[parts.length - 1];

      if (!folders.has(folder)) {
        folders.set(folder, { files: new Set(), hasTiles: false });
      }

      const folderData = folders.get(folder);
      folderData.files.add(file);

      // Detect if this folder contains panorama tiles
      if (Key.includes("/tiles/")) {
        folderData.hasTiles = true;
      }
    }

    const results = [];

    for (const [folder, data] of folders) {
      const { hasTiles } = data;
      const urls = {};

      // Always generate a signed URL for the thumbnail.webp
      urls.thumbnailUrl = await signedUrl(`${folder}/thumbnail.webp`);

      if (hasTiles) {
        // Panorama tiles are public; provide direct base URL instead of signed URLs
        urls.actualUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${folder}/tiles`;
      } else {
        // For regular images, generate signed URL
        urls.actualUrl = await signedUrl(`${folder}/${folder}.webp`);
      }

      results.push({ name: folder, type: guessType(folder), urls });
    }

    return results;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to generate signed URLs");
  }
}

/**
 * Generates a presigned GET URL for a given S3 object key.
 *
 * @param {string} key - The S3 object key.
 * @returns {Promise<string>} The presigned URL.
 */
async function signedUrl(key) {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: key }),
    { expiresIn: EXPIRATION_TIME }
  );
}

/**
 * Guesses the media type based on folder name prefix.
 *
 * @param {string} name - Folder name to guess type from.
 * @returns {string} The guessed media type.
 */
function guessType(name) {
  if (name.startsWith("pano")) return "panorama";
  if (name.startsWith("hdr")) return "hdr";
  if (name.startsWith("wide-angle")) return "wide-angle";
  return "photo";
}
