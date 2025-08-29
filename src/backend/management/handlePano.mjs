import fs from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";
import sharp from "sharp";
import logger from "../utils/logger.mjs";

export async function handlePano(mediaFolderPath, folderName) {
  const bearbeitenPath = path.join(mediaFolderPath, "bearbeitet");
  const zipPath = path.join(bearbeitenPath, "project-title.zip");
  const s3Folder = path.join(mediaFolderPath, "s3");

  logger.info(`[${folderName}]: Starting pano processing`);

  await fs.mkdir(s3Folder, { recursive: true });
  logger.info(`[${folderName}]: Ensured S3 folder exists at ${s3Folder}`);

  const extractPath = path.join(s3Folder, "project-title");

  try {
    logger.info(`[${folderName}]: Checking ZIP file at ${zipPath}`);
    const stat = await fs.stat(zipPath);
    if (!stat.isFile() || stat.size === 0) {
      logger.warn(
        `[${folderName}]: ZIP file is missing or empty. Skipping pano.`
      );
      return null;
    }

    // Extract project-title.zip
    logger.info(`[${folderName}]: Extracting ZIP to ${extractPath}`);
    try {
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
    } catch (zipError) {
      logger.error(
        `[${folderName}]: Error extracting ZIP file: ${zipError.message}`,
        zipError
      );
      throw zipError;
    }
    logger.info(`[${folderName}]: ZIP extraction completed`);

    // Original tiles folder path
    const originalTilesPath = path.join(extractPath, "app-files", "tiles");
    // Destination tiles folder under s3
    const s3TilesDest = path.join(s3Folder, "tiles");

    // Delete any existing tiles folder in s3
    try {
      await fs.rm(s3TilesDest, { recursive: true, force: true });
      logger.info(`[${folderName}]: Deleted existing s3/tiles folder`);
    } catch (err) {
      logger.warn(
        `[${folderName}]: Could not delete existing s3/tiles folder: ${err.message}`
      );
    }

    // Read subfolders inside original tiles folder
    const subfolders = (
      await fs.readdir(originalTilesPath, { withFileTypes: true })
    ).filter((d) => d.isDirectory());

    if (subfolders.length !== 1) {
      logger.warn(
        `[${folderName}]: Expected exactly one subfolder inside original tiles folder, found ${subfolders.length}. Skipping.`
      );
      return null;
    }

    // Rename the single subfolder inside original tiles to 'tiles' directly under s3
    const oldSubfolderPath = path.join(originalTilesPath, subfolders[0].name);
    await fs.rename(oldSubfolderPath, s3TilesDest);
    logger.info(
      `[${folderName}]: Moved and renamed subfolder ${subfolders[0].name} to s3/tiles`
    );

    // Delete original tiles folder and project-title extraction folder
    try {
      await fs.rm(originalTilesPath, { recursive: true, force: true });
      logger.info(
        `[${folderName}]: Deleted original tiles folder inside app-files`
      );
    } catch (err) {
      logger.warn(
        `[${folderName}]: Could not delete original tiles folder: ${err.message}`
      );
    }

    try {
      await fs.rm(extractPath, { recursive: true, force: true });
      logger.info(`[${folderName}]: Deleted project-title extraction folder`);
    } catch (err) {
      logger.warn(
        `[${folderName}]: Could not delete project-title extraction folder: ${err.message}`
      );
    }

    // Create thumbnail.webp inside s3 folder from jpg in bearbeiten folder
    const bearbeitenFiles = await fs.readdir(bearbeitenPath);
    const jpgFile = bearbeitenFiles.find((f) => /\.jpe?g$/i.test(f));
    if (!jpgFile) {
      logger.warn(
        `[${folderName}]: No JPG found for thumbnail in bearbeiten folder`
      );
      return null;
    }

    const inputPath = path.join(bearbeitenPath, jpgFile);
    const thumbnailPath = path.join(s3Folder, "thumbnail.webp");
    logger.info(`[${folderName}]: Creating thumbnail.webp at ${thumbnailPath}`);

    await sharp(inputPath)
      .resize({
        width: 2000,
        height: 1300,
        fit: "inside",
        position: sharp.strategy.attention,
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);
    logger.info(`[${folderName}]: Created thumbnail.webp successfully`);

    return { thumbnailPath };
  } catch (err) {
    logger.error(
      `[${folderName}]: Error in handlePano processing: ${err.message}`,
      err
    );
    throw err;
  }
}
