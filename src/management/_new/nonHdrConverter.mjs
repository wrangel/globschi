import fs from "fs";
import path from "path";
import sharp from "sharp";
import { execFile } from "child_process";
import { promisify } from "util";
import logger from "../utils/logger.mjs";

const execFileAsync = promisify(execFile);

const SOURCE_DIR = "/Users/matthiaswettstein/Downloads/DRONE/raw"; // TODO: set your HDR source folder
const BASE_DIR = path.join(SOURCE_DIR, "S3");
const MAX_WEBP_DIMENSION = 16383;

fs.mkdirSync(BASE_DIR, { recursive: true });

const tiffFiles = fs.readdirSync(SOURCE_DIR).filter((f) => /\.tiff?$/i.test(f));

async function preprocessTiffToPng(inputPath, tempPngPath) {
  try {
    await execFileAsync("magick", [
      inputPath,
      "-depth",
      "8",
      "-normalize",
      tempPngPath,
    ]);
  } catch (error) {
    logger.error(`Failed to preprocess TIFF ${inputPath} to PNG`, { error });
    throw error;
  }
}

async function convertTiffBatch() {
  for (const tiffFile of tiffFiles) {
    const inputPath = path.join(SOURCE_DIR, tiffFile);
    const baseName = path.parse(tiffFile).name;
    const fileDir = path.join(BASE_DIR, baseName);
    fs.mkdirSync(fileDir, { recursive: true });

    const tempPngPath = path.join(BASE_DIR, `${baseName}_temp.png`);

    try {
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

      logger.info(`Converted ${tiffFile} to WebP and created thumbnail.`);
    } catch (error) {
      logger.error(`Error processing file ${tiffFile}`, { error });
    }
  }
}

convertTiffBatch()
  .then(() => logger.info("Batch conversion completed"))
  .catch((err) => logger.error("Error in batch conversion:", { error: err }));
