import { Island } from "../../models/islandModel.mjs";
import { executeMongoQuery } from "../../utils/mongoUtils.mjs";
import logger from "../../utils/logger.mjs";

/**
 * Uploads or updates metadata document in MongoDB.
 * Removes _id fields from embedded levels on update to avoid conflicts.
 * Logs upload/insert results in detail.
 *
 * @param {Object} doc Metadata document to upload.
 */
export async function uploadMetadata(doc) {
  try {
    // Clone levels array with _id fields removed to avoid conflicts
    if (Array.isArray(doc.levels)) {
      doc.levels = doc.levels.map(({ _id, ...rest }) => rest);
    }

    const result = await executeMongoQuery(async () => {
      // Upsert document by name, insert if not exists
      return await Island.updateOne(
        { name: doc.name },
        { $set: doc },
        { upsert: true }
      );
    });

    logger.info(`Uploaded metadata for: ${doc.name}`);

    // Detailed logging about insert/update state
    if (result.upsertedId || result.upsertedCount) {
      logger.info(
        `Document inserted (upserted). Upsert info: ${JSON.stringify(
          result.upsertedId ?? result.upsertedCount
        )}`
      );
    } else if (result.modifiedCount > 0) {
      logger.info(`Document updated successfully.`);
    } else {
      logger.info(`Document unchanged (no update needed).`);
    }

    // Confirm document was saved properly by fetching fresh doc
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
    logger.error(`Failed to upload metadata for: ${doc.name}`, {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      error,
    });
    throw error;
  }
}
