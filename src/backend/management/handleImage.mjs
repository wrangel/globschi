// src/backend/management/handleImage.mjs

import fs from "fs/promises";
import path from "path";
import logger from "../utils/logger.mjs";
import sharp from "sharp";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const MAX_WEBP_DIMENSION = 16383;

/**
 * Process TIFF in "bearbeitet" and output webps in a sibling "s3" directory.
 * @param {string} mediaParentFolder - e.g. ".../pa_20230429_121442"
 * @param {string} outputBaseName - e.g. name property from metadata (used for .webp file name)
 */
export async function handleImage(mediaParentFolder, outputBaseName) {
  const bearbeitetFolder = path.join(mediaParentFolder, "bearbeitet");
  const s3Folder = path.join(mediaParentFolder, "s3");
  await fs.mkdir(s3Folder, { recursive: true });

  const files = await fs.readdir(bearbeitetFolder);
  const tiffFiles = files.filter((f) => /\.tiff?$/i.test(f));
  if (tiffFiles.length === 0) {
    logger.warn(`No TIFF files found in ${bearbeitetFolder}`);
    return null;
  }
  if (tiffFiles.length > 1) {
    logger.warn(
      `Multiple TIFF files found in ${bearbeitetFolder}, processing first: ${tiffFiles[0]}`
    );
  }
  const tiffFile = tiffFiles[0];
  const tiffFilePath = path.join(bearbeitetFolder, tiffFile);

  const tempPngPath = path.join(s3Folder, `${outputBaseName}_temp.png`);

  await execFileAsync("magick", [
    tiffFilePath,
    "-depth",
    "8",
    "-normalize",
    tempPngPath,
  ]);

  let image = sharp(tempPngPath);
  const metadata = await image.metadata();

  const losslessWebpPath = path.join(s3Folder, `${outputBaseName}.webp`);

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

  const thumbnailWebpPath = path.join(s3Folder, "thumbnail.webp");
  const tnImage = image.webp({ lossless: false, quality: 80 }).resize({
    width: 2000,
    height: 1300,
    fit: "inside",
    position: sharp.strategy.attention,
  });
  await tnImage.toFile(thumbnailWebpPath);

  await fs.unlink(tempPngPath);

  logger.info(`Processed TIFF to WebP and thumbnail in "${s3Folder}"`);

  return { losslessWebpPath, thumbnailWebpPath };
}
