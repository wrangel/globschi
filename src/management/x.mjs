// src/backend/management/convertImages.mjs

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// === Set these constants ===
const BASE_FOLDER = "/Volumes/Sicherung/Familie/Medien/Drohne/Webseite"; // absolute or relative to script
const OUTPUT_FOLDER =
  "/Users/matthiaswettstein/Library/CloudStorage/OneDrive-Persönlich/Bilder/Video"; // absolute or relative to script

// Ensure the output folder exists
async function ensureOutputFolder() {
  await fs.mkdir(OUTPUT_FOLDER, { recursive: true });
}

async function processFolder(folderName) {
  const modifiedDir = path.join(BASE_FOLDER, folderName, "modified");

  // Case 1: X/modified/X.tiff -> X.jpg
  const tiffFile = path.join(modifiedDir, `${folderName}.tif`);
  try {
    await fs.access(tiffFile);
    const outJpg = path.join(OUTPUT_FOLDER, `${folderName}.jpg`);
    await sharp(tiffFile).jpeg({ quality: 95 }).toFile(outJpg);
    console.log(`Converted TIFF to high-res JPG for ${folderName}`);
    return;
  } catch {}

  // Case 2: X/modified/?Panorama?.jpg -> downsized X.jpg
  const files = await fs.readdir(modifiedDir);
  const panoramaJpg = files.find(
    (f) =>
      f.toLowerCase().endsWith(".jpg") && f.toLowerCase().includes("panorama")
  );
  if (panoramaJpg) {
    const inJpg = path.join(modifiedDir, panoramaJpg);
    const outJpg = path.join(OUTPUT_FOLDER, `${folderName}.jpg`);
    await sharp(inJpg).jpeg({ quality: 95 }).toFile(outJpg);
    console.log(`Downsized & renamed panorama JPG for ${folderName}`);
  }
}

async function main() {
  await ensureOutputFolder();
  const entries = await fs.readdir(BASE_FOLDER, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  for (const folderName of folders) {
    try {
      await processFolder(folderName);
    } catch (err) {
      console.error(`Error processing ${folderName}: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
});
