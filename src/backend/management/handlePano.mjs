import fs from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";
import sharp from "sharp";
import logger from "../utils/logger.mjs";

/**
 * Handle pano processing for media folder.
 * @param {string} mediaFolderPath - Full path to renamed media folder (e.g. /.../pa_20230429_121442)
 * @param {string} folderName - New folder name (X)
 */
export async function handlePano(mediaFolderPath, folderName) {
  const bearbeitenPath = path.join(mediaFolderPath, "bearbeitet");
  const zipPath = path.join(bearbeitenPath, "project-title.zip");
  const s3Folder = path.join(mediaFolderPath, "s3");

  /*
  await fs.mkdir(s3Folder, { recursive: true });


  const extractPath = path.join(s3Folder, "project-title.zip");

  try {

    // Check if ZIP exists and non-empty
    const stat = await fs.stat(zipPath);
    if (!stat.isFile() || stat.size === 0) {
      logger.warn(
        `[${folderName}]: ZIP file missing or empty at ${zipPath}, skipping pano processing.`
      );
      return null;
    }


    // Extract to S3/project-title
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    logger.info(
      `[${folderName}]: Extracted project-title.zip to ${extractPath}`
    );

    // Inside S3/project-title/app-files/tiles
    const tilesPath = path.join(extractPath, "app-files", "tiles");

    // Rename the "tiles" folder itself to folderName (X)
    const renamedTilesPath = path.join(s3Folder, folderName);
    try {
      await fs.rm(renamedTilesPath, { recursive: true, force: true });
      logger.info(
        `[${folderName}]: Deleted existing folder ${renamedTilesPath}`
      );
    } catch {}

    await fs.rename(tilesPath, renamedTilesPath);
    logger.info(`[${folderName}]: Renamed tiles folder to ${folderName}`);

    // Inside renamedTilesPath (X), rename the only subfolder Y inside it to "tiles"
    const subfolders = (
      await fs.readdir(renamedTilesPath, { withFileTypes: true })
    ).filter((d) => d.isDirectory());

    if (subfolders.length !== 1) {
      logger.warn(
        `[${folderName}]: Expected exactly one subfolder inside ${folderName}, found ${subfolders.length}. Skipping further tile renaming.`
      );
    } else {
      const oldSubfolderPath = path.join(renamedTilesPath, subfolders[0].name);
      const newSubfolderPath = path.join(renamedTilesPath, "tiles");

      try {
        await fs.rm(newSubfolderPath, { recursive: true, force: true });
        logger.info(
          `[${folderName}]: Deleted existing 'tiles' folder inside ${folderName}`
        );
      } catch {}

      await fs.rename(oldSubfolderPath, newSubfolderPath);
      logger.info(
        `[${folderName}]: Renamed subfolder ${subfolders[0].name} to 'tiles'`
      );
    }

    // Delete preview.jpg from the renamed tiles folder (Y)
    const previewPath = path.join(renamedTilesPath, "tiles", "preview.jpg");
    try {
      await fs.rm(previewPath);
      logger.info(`[${folderName}]: Deleted preview.jpg inside tiles folder.`);
    } catch {}

    // Delete now empty project-title folder
    try {
      await fs.rm(extractPath, { recursive: true, force: true });
      logger.info(`[${folderName}]: Deleted project-title folder`);
    } catch (error) {
      logger.warn(
        `[${folderName}]: Could not delete project-title folder: ${error.message}`
      );
    }

    // Create the WebP thumbnail inside s3 folder from JPG in bearbeiten
    const bearbeitenFiles = await fs.readdir(bearbeitenPath);
    const jpgFile = bearbeitenFiles.find((f) => /\.jpe?g$/i.test(f));
    if (!jpgFile) {
      logger.warn(
        `[${folderName}]: No JPG found for thumbnail in Bearbeitungen.`
      );
      return null;
    }
    const inputPath = path.join(bearbeitenPath, jpgFile);
    const thumbnailPath = path.join(s3Folder, "thumbnail.webp");

    await sharp(inputPath)
      .resize({
        width: 2000,
        height: 1300,
        fit: "inside",
        position: sharp.strategy.attention,
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);

    logger.info(`[${folderName}]: Created thumbnail.webp inside ${s3Folder}`);

    return { thumbnailPath };

  } catch (error) {
    logger.error(
      `[${folderName}]: Error processing pano folder: ${error.message}`,
      error
    );
    throw error;
  }
         */
}
