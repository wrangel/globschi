// src/backend/management/uploadMetadata.mjs

import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../utils/mongoUtils.mjs";
import logger from "../utils/logger.mjs";

export async function uploadMetadata(doc) {
  try {
    await executeMongoQuery(async () => {
      await Island.updateOne(
        { name: doc.name },
        { $set: doc },
        { upsert: true }
      );
      return null;
    });
    logger.info(`Uploaded metadata for: ${doc.name}`);

    // Fetch inserted/updated doc for confirmation logging
    const savedDoc = await executeMongoQuery(() =>
      Island.findOne({ name: doc.name }).lean()
    );
    if (savedDoc) {
      logger.info(
        `Confirmed saved document:\n${JSON.stringify(savedDoc, null, 2)}`
      );
    } else {
      logger.warn(`Document with name ${doc.name} not found after upload.`);
    }
  } catch (error) {
    logger.error(`Failed to upload metadata for: ${doc.name}`, { error });
    throw error;
  }
}
