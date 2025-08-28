import { readdir } from "fs/promises";
import path from "path";
import logger from "../utils/logger.mjs";

import { processSingleMedia } from "./metadataCollector.mjs"; // single media folder processing
import { uploadSingleMetadata } from "./metadataUploader.mjs"; // single metadata uploader

async function orchestrateMediaProcessing() {
  const baseDir = process.env.INPUT_DIRECTORY;
  const entries = await readdir(baseDir, { withFileTypes: true });
  const mediaFolders = entries
    .filter((ent) => ent.isDirectory())
    .map((dir) => path.join(baseDir, dir.name));

  if (mediaFolders.length === 0) {
    logger.info("No media folders found to process");
    return;
  }

  logger.info(`Found ${mediaFolders.length} media folders to process`);

  for (const mediaDirPath of mediaFolders) {
    logger.info(`Processing media folder: ${mediaDirPath}`);

    try {
      const processed = await processSingleMedia(mediaDirPath);

      if (!processed || !processed.metadata) {
        logger.warn(
          `Skipping upload for ${mediaDirPath} as processing returned no metadata`
        );
        continue;
      }

      await uploadSingleMetadata(processed.metadata);
      logger.info(`Completed processing and uploading for: ${mediaDirPath}`);
    } catch (error) {
      logger.error(`Error in processing/uploading for ${mediaDirPath}`, {
        error,
      });
    }
  }

  logger.info("All media processing and metadata upload complete");
}

orchestrateMediaProcessing().catch((err) => {
  logger.error("Uncaught error in orchestrator", { error: err });
});
