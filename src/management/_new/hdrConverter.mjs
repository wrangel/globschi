import fs from "fs";
import path from "path";
import sharp from "sharp";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const SOURCE_DIR = "/Users/matthiaswettstein/Downloads/DRONE/raw"; // example HDR source folder
const BASE_DIR = path.join(SOURCE_DIR, "S3");
const MAX_WEBP_DIMENSION = 16383;

fs.mkdirSync(BASE_DIR, { recursive: true });

const tiffFiles = fs.readdirSync(SOURCE_DIR).filter((f) => /\.tiff?$/i.test(f));

async function preprocessTiffToPng(inputPath, tempPngPath) {
  // Convert 32-bit TIFF to 8-bit normalized PNG (ImageMagick)
  await execFileAsync("magick", [
    inputPath,
    "-depth",
    "8",
    "-normalize",
    tempPngPath,
  ]);
}

async function convertTiffBatchHdr() {
  for (const tiffFile of tiffFiles) {
    const inputPath = path.join(SOURCE_DIR, tiffFile);
    const baseName = path.parse(tiffFile).name;
    const fileDir = path.join(BASE_DIR, baseName);
    fs.mkdirSync(fileDir, { recursive: true });

    // Preconvert 32-bit TIFF to 8-bit PNG
    const tempPngPath = path.join(BASE_DIR, `${baseName}_temp.png`);
    await preprocessTiffToPng(inputPath, tempPngPath);

    let image = sharp(tempPngPath);
    const metadata = await image.metadata();

    const losslessWebpPath = path.join(fileDir, `${baseName}.webp`);
    const thumbnailWebpPath = path.join(fileDir, "thumbnail.webp");

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

    let tnImage = image.webp({ lossless: false, quality: 80 }).resize({
      width: 2000,
      height: 1300,
      fit: "inside",
      position: sharp.strategy.attention,
    });
    await tnImage.toFile(thumbnailWebpPath);

    await fs.promises.unlink(tempPngPath);
  }
}

convertTiffBatchHdr()
  .then(() => console.log("HDR batch conversion completed"))
  .catch((err) => console.error("Error in HDR batch conversion:", err));
