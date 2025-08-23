import fs from "fs";
import path from "path";
import sharp from "sharp";

const SOURCE_DIR = "A";
const HR_DIR = path.join(SOURCE_DIR, "hr");
const TN_DIR = path.join(SOURCE_DIR, "tn");
const MAX_WEBP_DIMENSION = 16383;

// Create output directories if they don't exist
fs.mkdirSync(HR_DIR, { recursive: true });
fs.mkdirSync(TN_DIR, { recursive: true });

const tiffFiles = fs.readdirSync(SOURCE_DIR).filter((f) => /\.tiff?$/i.test(f));

async function convertTiffBatch() {
  for (const tiffFile of tiffFiles) {
    const inputPath = path.join(SOURCE_DIR, tiffFile);

    let image = sharp(inputPath);
    const metadata = await image.metadata();

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
    await hrImage
      .webp({ lossless: true })
      .toFile(path.join(HR_DIR, tiffFile.replace(/\.(tiff|tif)$/i, ".webp")));

    // Thumbnail lossy WebP
    let tnImage = image.webp({ lossless: false, quality: 80 }).resize({
      width: 2000,
      height: 1300,
      fit: "inside",
      position: sharp.strategy.attention,
    });
    await tnImage.toFile(
      path.join(TN_DIR, tiffFile.replace(/\.(tiff|tif)$/i, ".webp"))
    );
  }
}

convertTiffBatch()
  .then(() => console.log("Batch conversion completed"))
  .catch((err) => console.error("Error in batch conversion:", err));
