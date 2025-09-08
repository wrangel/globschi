// src/backend/management/orchestrate.mjs

import { readdir } from "fs/promises";
import path from "path";
import logger from "../utils/logger.mjs";

import { collectMetadata } from "./collectMetadata.mjs";
import { handleFolder } from "./handleFolder.mjs";
import { handleImage } from "./handleImage.mjs";
import { handlePano } from "./handlePano.mjs";
import { uploadMetadata } from "./uploadMetadata.mjs";
import { uploadMedia } from "./uploadMedia.mjs";

/**
 * Orchestrate processing of multiple media folders.
 * Reads folders from input directory, collects metadata, renames folders,
 * handles media processing (image/pano), uploads metadata and media.
 * Logs processing steps and errors.
 */
async function orchestrate() {
  const baseDir = process.env.INPUT_DIRECTORY;

  const entries = await readdir(baseDir, { withFileTypes: true });
  const mediaFolders = entries
    .filter((ent) => ent.isDirectory())
    .map((dir) => path.join(baseDir, dir.name));

  if (mediaFolders.length === 0) {
    logger.info("No media folders to process.");
    return;
  }

  logger.info(`Found ${mediaFolders.length} media folders.`);

  for (const mediaDirPath of mediaFolders) {
    logger.info(`Processing folder: ${mediaDirPath}`);
    try {
      // 1. Collect metadata
      const processed = await collectMetadata(mediaDirPath);
      if (!processed || !processed.metadata) {
        logger.warn(`No metadata returned for ${mediaDirPath}, skipping.`);
        continue;
      }

      const mediaType = processed.metadata.type;
      const newName = processed.metadata.name;

      // 2. Rename folder first
      const newFolderPath = await handleFolder(mediaDirPath, newName);

      // 3. Handle media based on type
      let panoExtraProps = null;
      if (mediaType === "hdr" || mediaType === "wide_angle") {
        await handleImage(newFolderPath, newName);
      } else if (mediaType === "pano") {
        panoExtraProps = await handlePano(newFolderPath, newName);
      } else {
        // fallback or unknown mediaType (e.g., video)
        logger.warn(`Unknown media type: ${mediaType}`);
      }

      // 4. Merge pano-specific props into metadata if any
      if (panoExtraProps) {
        processed.metadata.levels = panoExtraProps.levels || null;
        processed.metadata.initialViewParameters =
          panoExtraProps.initialViewParameters || null;
      }

      // 5. Upload metadata to MongoDB
      await uploadMetadata(processed.metadata);

      logger.info(`Completed processing for folder: ${mediaDirPath}`);

      // 6. Upload media to S3
      await uploadMedia(newFolderPath, newName);
    } catch (error) {
      logger.error(`Error processing folder ${mediaDirPath}`, { error });
    }
  }

  logger.info("All processing completed.");
}

// Launch orchestration with error handling for uncaught async errors
orchestrate().catch((err) => {
  logger.error("Uncaught error in orchestrator:", { error: err });
});
