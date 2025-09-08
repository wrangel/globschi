// src/backend/management/uploadMetadata.mjs

import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../utils/mongoUtils.mjs";
import logger from "../utils/logger.mjs";

export async function uploadMetadata(doc) {
  try {
    const result = await executeMongoQuery(async () => {
      // Use updateOne with upsert:true to insert if doesn't exist
      return await Island.updateOne(
        { name: doc.name },
        { $set: doc },
        { upsert: true }
      );
    });

    logger.info(`Uploaded metadata for: ${doc.name}`);

    // Log detailed upsert result info (optional)
    if (result.upsertedCount ?? result.upsertedId) {
      logger.info(
        `Document was inserted (upserted). Upsert info: ${JSON.stringify(
          result.upsertedId || result.upsertedCount
        )}`
      );
    } else if (result.modifiedCount) {
      logger.info(`Document was updated successfully.`);
    } else {
      logger.info(`Document unchanged (no update needed).`);
    }

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
    // Improved error logging for debugging
    logger.error(`Failed to upload metadata for: ${doc.name}`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
      error,
    });
    throw error;
  }
}
