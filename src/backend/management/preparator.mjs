import fs from "fs/promises";
import path from "path";
import logger from "../utils/logger.mjs";
import sharp from "sharp";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const MAX_WEBP_DIMENSION = 16383;

async function processSingleBearbeitetFolder(
  bearbeitetFolderPath,
  outputBaseName
) {
  try {
    const parentDir = path.dirname(bearbeitetFolderPath);
    const s3Folder = path.join(parentDir, "s3");
    await fs.mkdir(s3Folder, { recursive: true });

    const files = await fs.readdir(bearbeitetFolderPath);
    const tiffFiles = files.filter((f) => /\.tiff?$/i.test(f));
    if (tiffFiles.length === 0) {
      logger.warn(`No TIFF files found in ${bearbeitetFolderPath}`);
      return null;
    }
    if (tiffFiles.length > 1) {
      logger.warn(
        `Multiple TIFF files found in ${bearbeitetFolderPath}, processing first: ${tiffFiles[0]}`
      );
    }
    const tiffFile = tiffFiles[0];
    const tiffFilePath = path.join(bearbeitetFolderPath, tiffFile);

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
  } catch (err) {
    logger.error(
      `Error processing 'bearbeitet' folder at ${bearbeitetFolderPath}:`,
      err
    );
    throw err;
  }
}

/**
 * Rename a media folder to the new name, then process "bearbeitet" TIFFs if exists and type is not "pano".
 * The .webp and thumbnail.webp are created in a sibling 's3' folder to 'bearbeitet'.
 */
export async function renameMediaFolder(
  originalFolderPath,
  newName,
  mediaType
) {
  try {
    const parentDir = path.dirname(originalFolderPath);
    const newFolderPath = path.join(parentDir, newName);

    // Rename the folder
    await fs.rename(originalFolderPath, newFolderPath);
    logger.info(
      `Renamed folder: '${originalFolderPath}' to '${newFolderPath}'`
    );

    if (mediaType !== "pano") {
      const bearbeitetPath = path.join(newFolderPath, "bearbeitet");
      try {
        const stat = await fs.stat(bearbeitetPath);
        if (stat.isDirectory()) {
          const webpFiles = await processSingleBearbeitetFolder(
            bearbeitetPath,
            newName
          );
          return { newFolderPath, webpFiles };
        }
      } catch {
        logger.info(`No "bearbeitet" folder to process in: '${newFolderPath}'`);
      }
    } else {
      logger.info(
        `Skipping "bearbeitet" processing for "pano" type folder '${newFolderPath}'`
      );
    }

    return { newFolderPath, webpFiles: null };
  } catch (err) {
    logger.error(
      `Error renaming folder '${originalFolderPath}' to '${newName}':`,
      err
    );
    throw err;
  }
}
