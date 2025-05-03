// src/backend/mediaUrlServer.mjs

import fs from "fs/promises";
import path from "path";

const MEDIA_TYPES = ["pan", "wide_angle", "thumbnails", "hdr"];

/**
 * Generates URLs for local media files.
 * @returns {Promise<Array>} Array of objects with name and URLs by type.
 */
export async function getLocalMediaUrls() {
  const mediaPath = process.env.MEDIA_PATH;
  const media = [];

  for (const type of MEDIA_TYPES) {
    const dir = path.join(mediaPath, type);
    let files = [];
    try {
      files = await fs.readdir(dir);
    } catch (err) {
      continue; // skip missing folders
    }
    for (const file of files) {
      if (!file.endsWith(".webp")) continue; // only webp files
      const name = file.replace(/\.webp$/, "");
      let entry = media.find((m) => m.name === name);
      if (!entry) {
        entry = { name, urls: {} };
        media.push(entry);
      }
      entry.urls[type] = `/media/${type}/${file}`;
    }
  }

  // Optional: Debug log
  console.log("First few media URLs:", media.slice(0, 5));

  return media;
}
