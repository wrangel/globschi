// src/backend/signedUrlServer.mjs

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { listS3BucketContents } from "./helpers/awsHelpers.mjs";
import { s3Client } from "./helpers/awsHelpers.mjs";
import { EXPIRATION_TIME } from "./constants.mjs";

const CUBEMAP_FACES = ["front", "back", "left", "right", "top", "bottom"];

export async function getUrls() {
  try {
    const objects = await listS3BucketContents(process.env.AWS_BUCKET_SITE);

    // 1. group by folder name (top-level folder only)
    const folders = new Map(); // folderName -> { files:Set, type }
    for (const { Key } of objects) {
      const parts = Key.split("/");
      if (parts.length < 2) continue; // skip root files
      const folder = parts[0];
      const file = parts[parts.length - 1];

      if (!folders.has(folder)) folders.set(folder, new Set());
      folders.get(folder).add(file);
    }

    // 2. build response
    const results = [];
    for (const [folder, files] of folders) {
      const isPano = CUBEMAP_FACES.some((f) => files.has(`${f}.webp`));
      const urls = {};

      // thumbnail (always present)
      urls.thumbnail = await signedUrl(`${folder}/thumbnail.webp`);

      if (isPano) {
        // panorama → 6 faces
        for (const face of CUBEMAP_FACES) {
          urls[face] = await signedUrl(`${folder}/${face}.webp`);
        }
      } else {
        // single image → folderName.webp
        urls.actual = await signedUrl(`${folder}/${folder}.webp`);
      }

      results.push({ name: folder, type: guessType(folder), urls });
    }
    return results;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to generate signed URLs");
  }
}

/* ---------- helpers ---------- */
async function signedUrl(key) {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: process.env.AWS_BUCKET_SITE, Key: key }),
    { expiresIn: EXPIRATION_TIME }
  );
}

function guessType(name) {
  if (name.startsWith("pano")) return "panorama";
  if (name.startsWith("hdr")) return "hdr";
  if (name.startsWith("wide-angle")) return "wide-angle";
  return "photo";
}
