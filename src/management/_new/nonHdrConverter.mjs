import fs from "fs";
import path from "path";
import sharp from "sharp";

const SOURCE_DIR = "/Users/matthiaswettstein/Downloads/DRONE/TIF"; // TODO
const BASE_DIR = path.join(SOURCE_DIR, "S3");
const MAX_WEBP_DIMENSION = 16383;

// Create S3 destination folder if it doesn't exist
fs.mkdirSync(BASE_DIR, { recursive: true });

const tiffFiles = fs.readdirSync(SOURCE_DIR).filter((f) => /\.tiff?$/i.test(f));

async function convertTiffBatch() {
  for (const tiffFile of tiffFiles) {
    const inputPath = path.join(SOURCE_DIR, tiffFile);

    // Folder name based on filename without extension
    const baseName = path.parse(tiffFile).name;
    const fileDir = path.join(BASE_DIR, baseName);
    fs.mkdirSync(fileDir, { recursive: true });

    let image = sharp(inputPath);
    const metadata = await image.metadata();

    // Paths for outputs
    const losslessWebpPath = path.join(fileDir, `${baseName}.webp`);
    const thumbnailWebpPath = path.join(fileDir, "thumbnail.webp");

    // High-res lossless WebP
    let hrImage = image;
    if (
      metadata.width > MAX_WEBP_DIMENSION ||
      metadata.height > MAX_WEBP_DIMENSION
    ) {
      const aspectRatio = metadata.width / metadata.height;
      let newWidth = Math.min(metadata.width, MAX_WEBP_DIMENSION);
      let newHeight = Math.round(newWidth / aspectRatio);
      if (newHeight > MAX_WEBP_DIMENSION) {
        newHeight = MAX_WEBP_DIMENSION;
        newWidth = Math.round(newHeight * aspectRatio);
      }
      hrImage = image.resize(newWidth, newHeight, { fit: "inside" });
    }
    await hrImage.webp({ lossless: true }).toFile(losslessWebpPath);

    // Thumbnail lossy WebP
    let tnImage = image.webp({ lossless: false, quality: 80 }).resize({
      width: 2000,
      height: 1300,
      fit: "inside",
      position: sharp.strategy.attention,
    });
    await tnImage.toFile(thumbnailWebpPath);
  }
}

convertTiffBatch()
  .then(() => console.log("Batch conversion completed"))
  .catch((err) => console.error("Error in batch conversion:", err));
