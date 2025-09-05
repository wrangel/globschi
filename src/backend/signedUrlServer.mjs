// src/backend/signedUrlServer.mjs

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { listS3BucketContents, s3Client } from "./utils/awsUtils.mjs";
import { EXPIRATION_TIME } from "./constants.mjs";
import logger from "./utils/logger.mjs";

const THUMBNAIL = "thumbnail.webp";
const PUBLIC_BASE =
  process.env.AWS_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com`;

/**
 * @typedef {{name:string, type:string, urls:{thumbnailUrl:string, actualUrl:string}}} FolderUrls
 * @returns {Promise<FolderUrls[]>}
 */
export async function getUrls(maxFolders = 10000) {
  const t0 = Date.now();
  try {
    const objects = await listS3BucketContents(process.env.AWS_BUCKET);
    const folders = new Map(); // folder -> {files:Set, hasTiles:bool}

    for (const { Key } of objects) {
      const parts = Key.split("/");
      if (parts.length < 2) continue; // skip root-level objects
      const folder = parts[0];
      if (folders.size >= maxFolders) break;

      if (!folders.has(folder))
        folders.set(folder, { files: new Set(), hasTiles: false });
      const entry = folders.get(folder);
      entry.files.add(parts.at(-1));
      if (Key.includes("/tiles/")) entry.hasTiles = true;
    }

    const promises = [...folders.entries()]
      .slice(0, maxFolders)
      .map(async ([folder, meta]) => {
        const thumbKey = `${folder}/${THUMBNAIL}`;
        const [thumbnailUrl, actualUrl] = await Promise.all([
          signedUrl(thumbKey),
          meta.hasTiles
            ? `${PUBLIC_BASE}/${encodeURIComponent(folder)}/tiles`
            : signedUrl(`${folder}/${folder}.webp`),
        ]);
        return {
          name: folder,
          type: guessType(folder),
          urls: { thumbnailUrl, actualUrl },
        };
      });

    const result = await Promise.all(promises);
    logger.info(
      `[getUrls] folders=${result.length} duration=${Date.now() - t0}ms`
    );
    return result;
  } catch (err) {
    logger.error("[getUrls] failed", { error: err });
    return []; // fail-open → UI can still render
  }
}

export const healthCheck = async () => {
  try {
    await listS3BucketContents(process.env.AWS_BUCKET, false, 1);
    return true;
  } catch {
    return false;
  }
};

/* ---------- pure helpers – exported for tests ---------- */
export const guessType = (name) => {
  if (name.startsWith("pano")) return "panorama";
  if (name.startsWith("hdr")) return "hdr";
  if (name.startsWith("wide-angle")) return "wide-angle";
  return "photo";
};

async function signedUrl(key) {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: key }),
    { expiresIn: EXPIRATION_TIME }
  );
}
