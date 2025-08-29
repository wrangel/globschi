import { readdir } from "fs/promises";
import path from "path";
import logger from "../utils/logger.mjs";

import { collectMetadata } from "./collectMetadata.mjs";
import { handleFolder } from "./handleFolder.mjs";
import { handleImage } from "./handleImage.mjs";
import { handlePano } from "./handlePano.mjs";
import { uploadMetadata } from "./uploadMetadata.mjs";
import { uploadMedia } from "./uploadMedia.mjs";

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

      // 3. Medium logic
      if (mediaType === "hdr" || mediaType === "wide angle") {
        await handleImage(newFolderPath, newName);
      } else if (mediaType === "pano") {
        await handlePano(newFolderPath, newName);
      } else {
        // fallback or unknown mediaType // video
        console.warn(`Unknown media type: ${mediaType}`);
      }

      // Step 4: Upload metadata to MongoDB
      await uploadMetadata(processed.metadata);

      logger.info(`Completed processing for folder: ${mediaDirPath}`);

      // Step 5: Upload media to S3
      await uploadMedia(newFolderPath, newName);
    } catch (error) {
      logger.error(`Error processing folder ${mediaDirPath}`, { error });
    }
  }

  logger.info("All processing completed.");
}

orchestrate().catch((err) => {
  logger.error("Uncaught error in orchestrator:", { error: err });
});
