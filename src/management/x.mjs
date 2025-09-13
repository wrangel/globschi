import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// === Set these constants ===
const BASE_FOLDER = "/Users/matthiaswettstein/Downloads/_Sonstige_TODO"; // input root folder
const OUTPUT_FOLDER =
  "/Users/matthiaswettstein/Library/CloudStorage/OneDrive-Persönlich/Bilder/Video"; // output folder

async function ensureOutputFolder() {
  await fs.mkdir(OUTPUT_FOLDER, { recursive: true });
}

async function processFolder(folderName) {
  const modifiedDir = path.join(BASE_FOLDER, folderName, "modified");
  console.log(`Processing folder: ${folderName}`);

  try {
    const files = await fs.readdir(modifiedDir);
    const tiffFiles = files.filter((f) => f.toLowerCase().endsWith(".tif"));

    if (tiffFiles.length > 0) {
      for (const tiffFile of tiffFiles) {
        const inputPath = path.join(modifiedDir, tiffFile);
        const outputFileName =
          tiffFiles.length === 1
            ? `${folderName}.jpg`
            : `${folderName}_${tiffFile.replace(/\.tif$/i, "")}.jpg`;
        const outputPath = path.join(OUTPUT_FOLDER, outputFileName);

        try {
          let image = sharp(inputPath);
          const metadata = await image.metadata();

          console.log(`Metadata for ${tiffFile}:`, metadata); // If the image is not a standard 8-bit image, we must explicitly convert it.

          if (metadata.depth !== "uchar") {
            // `uchar` is Sharp's term for 8-bit unsigned integer
            console.log(`Image ${tiffFile} is not 8-bit, converting...`);
            image = image.normalize().toColourspace("srgb"); // Normalize and force sRGB conversion
          }

          if (metadata.hasAlpha) {
            console.log(
              `Image ${tiffFile} has alpha channel; flattening to white background`
            );
            image = image.flatten({ background: { r: 255, g: 255, b: 255 } });
          } // Explicitly handle color space conversion

          image = image.toColourspace("srgb"); // Save as JPEG

          await image.jpeg({ quality: 95, force: true }).toFile(outputPath);

          console.log(`Converted TIFF to JPG: ${outputFileName}`);
        } catch (procErr) {
          console.error(
            `Error processing file ${tiffFile} in folder ${folderName}: ${procErr.message}`
          );
        }
      }
    } else {
      console.log(`No TIFF files found in ${modifiedDir}`);
    } // ... the rest of your original function for panoramas
  } catch (err) {
    console.error(`Error processing folder ${folderName}: ${err.message}`);
  }
}

async function main() {
  await ensureOutputFolder();
  const entries = await fs.readdir(BASE_FOLDER, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  for (const folderName of folders) {
    await processFolder(folderName);
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
});
