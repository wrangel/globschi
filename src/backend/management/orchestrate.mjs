// src/backend/management/orchestrate.mjs

import { readdir } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import logger from "../utils/logger.mjs";

import { collectMetadata } from "./collectMetadata.mjs";
import { handleFolder } from "./handleFolder.mjs";
import { handleImage } from "./handleImage.mjs";
import { handlePano } from "./handlePano.mjs";
import { uploadMetadata } from "./uploadMetadata.mjs";
import { uploadMedia } from "./uploadMedia.mjs";

/**
 * Orchestrate processing of multiple media folders.
 * Opens MongoDB connection, processes, then closes connection when done.
 */
export async function orchestrate() {
  try {
    // 1. Connect to MongoDB before starting processing loop
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info("MongoDB connected");

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
        // 2. Collect metadata
        const processed = await collectMetadata(mediaDirPath);
        if (!processed || !processed.metadata) {
          logger.warn(`No metadata returned for ${mediaDirPath}, skipping.`);
          continue;
        }

        const mediaType = processed.metadata.type;
        const newName = processed.metadata.name;

        // 3. Rename folder first
        const newFolderPath = await handleFolder(mediaDirPath, newName);

        // 4. Handle media based on type
        let panoExtraProps = null;
        if (mediaType === "hdr" || mediaType === "wide_angle") {
          await handleImage(newFolderPath, newName);
        } else if (mediaType === "pano") {
          panoExtraProps = await handlePano(newFolderPath, newName);
        } else {
          // fallback or unknown mediaType (e.g., video)
          logger.warn(`Unknown media type: ${mediaType}`);
        }

        // 5. Merge pano-specific props into metadata if any
        if (panoExtraProps) {
          processed.metadata.levels = panoExtraProps.levels || null;
          processed.metadata.initialViewParameters =
            panoExtraProps.initialViewParameters || null;
        }

        // 6. Upload metadata to MongoDB
        await uploadMetadata(processed.metadata);

        logger.info(`Completed processing for folder: ${mediaDirPath}`);

        // 7. Upload media to S3
        await uploadMedia(newFolderPath, newName);
      } catch (error) {
        logger.error(`Error processing folder ${mediaDirPath}`, { error });
      }
    }
  } catch (err) {
    logger.error("Failed MongoDB connection or orchestration:", err);
    throw err;
  } finally {
    // 8. Close MongoDB connection gracefully when done
    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
    } catch (closeErr) {
      logger.error("Failed to close MongoDB connection:", closeErr);
    }
  }
}

// Launch orchestration with error handling for uncaught async errors
orchestrate().catch((err) => {
  logger.error("Uncaught error in orchestrator:", { error: err });
});
