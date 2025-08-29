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

    const tilesPath = path.join(extractPath, "app-files", "tiles");
    const renamedTilesPath = path.join(s3Folder, folderName);

    logger.info(
      `[${folderName}]: Removing existing '${renamedTilesPath}' folder if exists`
    );
    try {
      await fs.rm(renamedTilesPath, { recursive: true, force: true });
      logger.info(
        `[${folderName}]: Deleted existing folder ${renamedTilesPath}`
      );
    } catch (rmErr) {
      logger.error(
        `[${folderName}]: Failed to delete existing folder: ${rmErr.message}`,
        rmErr
      );
    }

    logger.info(
      `[${folderName}]: Renaming tiles folder from '${tilesPath}' to '${renamedTilesPath}'`
    );
    await fs.rename(tilesPath, renamedTilesPath);
    logger.info(`[${folderName}]: Renamed tiles folder to ${folderName}`);

    const subfolders = (
      await fs.readdir(renamedTilesPath, { withFileTypes: true })
    ).filter((d) => d.isDirectory());
    if (subfolders.length !== 1) {
      logger.warn(
        `[${folderName}]: Expected one subfolder inside tiles folder, found ${subfolders.length}. Skipping further renaming.`
      );
    } else {
      const oldSubfolderPath = path.join(renamedTilesPath, subfolders[0].name);
      const newSubfolderPath = path.join(renamedTilesPath, "tiles");

      logger.info(`[${folderName}]: Deleting existing 'tiles' folder if any`);
      try {
        await fs.rm(newSubfolderPath, { recursive: true, force: true });
        logger.info(`[${folderName}]: Removed existing 'tiles' folder`);
      } catch (rmTilesErr) {
        logger.warn(
          `[${folderName}]: Error removing existing 'tiles' folder: ${rmTilesErr.message}`,
          rmTilesErr
        );
      }

      logger.info(
        `[${folderName}]: Renaming subfolder ${subfolders[0].name} to 'tiles'`
      );
      await fs.rename(oldSubfolderPath, newSubfolderPath);
      logger.info(`[${folderName}]: Renamed subfolder to 'tiles'`);
    }

    const previewPath = path.join(renamedTilesPath, "tiles", "preview.jpg");
    logger.info(
      `[${folderName}]: Deleting preview.jpg at ${previewPath} if present`
    );
    try {
      await fs.rm(previewPath);
      logger.info(`[${folderName}]: Deleted preview.jpg successfully`);
    } catch {
      logger.info(`[${folderName}]: preview.jpg not found or already deleted`);
    }

    logger.info(
      `[${folderName}]: Deleting project-title folder at ${extractPath}`
    );
    try {
      await fs.rm(extractPath, { recursive: true, force: true });
      logger.info(`[${folderName}]: Deleted project-title folder`);
    } catch (delErr) {
      logger.warn(
        `[${folderName}]: Could not delete project-title folder: ${delErr.message}`,
        delErr
      );
    }

    logger.info(
      `[${folderName}]: Searching JPG file in bearbeiten folder for thumbnail`
    );
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
