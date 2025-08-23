// src/backend/signedUrlServer.mjs

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { listS3BucketContents, s3Client } from "../utils/awsUtils.mjs";
import { EXPIRATION_TIME } from "./constants.mjs";

export async function getUrls() {
  try {
    const objects = await listS3BucketContents(process.env.AWS_BUCKET);

    // Group objects by top-level folder
    const folders = new Map();

    for (const { Key } of objects) {
      const parts = Key.split("/");
      if (parts.length < 2) continue;

      const folder = parts[0];
      const file = parts[parts.length - 1];

      if (!folders.has(folder)) {
        folders.set(folder, { files: new Set(), hasTiles: false });
      }

      const folderData = folders.get(folder);
      folderData.files.add(file);

      // Detect panorama tiles folder presence
      if (Key.includes("/tiles/")) {
        folderData.hasTiles = true;
      }
    }

    const results = [];

    for (const [folder, data] of folders) {
      const { hasTiles } = data;
      const urls = {};

      // Always generate signed URL for thumbnail.webp
      urls.thumbnailUrl = await signedUrl(`${folder}/thumbnail.webp`);

      if (hasTiles) {
        // Panorama tiles are public; return base URL without signed URLs for tiles
        urls.actualUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${folder}/tiles`;
      } else {
        // For normal images generate signed URLs
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

async function signedUrl(key) {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: key }),
    { expiresIn: EXPIRATION_TIME }
  );
}

function guessType(name) {
  if (name.startsWith("pano")) return "panorama";
  if (name.startsWith("hdr")) return "hdr";
  if (name.startsWith("wide-angle")) return "wide-angle";
  return "photo";
}
