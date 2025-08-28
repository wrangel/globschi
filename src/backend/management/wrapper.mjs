import { readdir } from "fs/promises";
import path from "path";
import logger from "../utils/logger.mjs";

import { processSingleMedia } from "./metadataCollector.mjs";
import { renameMediaFolder } from "./preparator.mjs";
import { uploadSingleMetadata } from "./metadataUploader.mjs";

async function orchestrateAll() {
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
      // Step 1: Collect metadata (includes media type)
      const processed = await processSingleMedia(mediaDirPath);

      if (!processed || !processed.metadata) {
        logger.warn(`No metadata returned for ${mediaDirPath}, skipping.`);
        continue;
      }

      const mediaType = processed.metadata.type;
      const newName = processed.metadata.name;

      // Step 2: Rename folder and conditionally process "bearbeitet" folder based on type
      const { newFolderPath, webpFiles } = await renameMediaFolder(
        mediaDirPath,
        newName,
        mediaType // pass media type for conditional TIFF processing
      );

      // Optionally log WebP output paths
      if (webpFiles) {
        logger.info(`WebP files created: ${JSON.stringify(webpFiles)}`);
      }

      /*
      // Step 3: Upload metadata to MongoDB
      await uploadSingleMetadata(processed.metadata);

      logger.info(`Completed processing for folder: ${mediaDirPath}`);
      */
    } catch (error) {
      logger.error(`Error processing folder ${mediaDirPath}`, { error });
    }
  }

  logger.info("All processing completed.");
}

orchestrateAll().catch((err) => {
  logger.error("Uncaught error in orchestrator:", { error: err });
});
