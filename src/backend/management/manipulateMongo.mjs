// src/backend/management/newFieldAdder.mjs

import logger from "../helpers/logger.mjs";
import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../helpers/mongoHelpers.mjs";

/**
 * Updates all Island documents in the MongoDB collection with a "drone" field.
 * The drone type is determined based on the length of the island's name:
 * - If the name is longer than 8 characters, the drone is set to "DJI Mini 4 Pro".
 * - Otherwise, the drone is set to "DJI Mini 2".
 *
 * This function performs the following operations:
 * 1. Connects to the MongoDB database.
 * 2. Executes an updateMany operation on all Island documents.
 * 3. Logs the number of matched and modified documents.
 * 4. Retrieves and logs a sample of updated documents for verification.
 * 5. Disconnects from the database.
 *
 * @async
 * @function updateIslandsWithDroneField
 * @throws {Error} If there's an issue connecting to the database or performing the update.
 * @returns {Promise<void>}
 */
async function updateIslandsWithDroneField() {
  try {
    const result = await executeMongoQuery(
      async () => {
        const updateResult = await Island.updateMany(
          {}, // Match all documents
          [
            {
              $set: {
                drone: {
                  $cond: {
                    if: { $gt: [{ $strLenCP: "$name" }, 8] },
                    then: "DJI Mini 4 Pro",
                    else: "DJI Mini 2",
                  },
                },
              },
            },
          ]
        );

        return updateResult;
      },
      "Island",
      true
    );

    logger.info(
      `Updated ${result.modifiedCount} Island documents with drone field`
    );

    // Optionally, fetch and log a few updated documents
    const updatedDocs = await executeMongoQuery(async () => {
      return await Island.find().limit(5).lean();
    }, "Island");

    logger.info("Sample of updated documents:");
    updatedDocs.forEach((doc, index) => {
      logger.info(`\nIsland ${index + 1}:`);
      logger.info(JSON.stringify(doc, null, 2));
    });
  } catch (error) {
    logger.error("Error updating Island documents:", { error });
  }
}

// Self-invoking async function to allow top-level await
(async () => {
  try {
    await updateIslandsWithDroneField();
  } catch (error) {
    logger.error("An unexpected error occurred:", { error });
    process.exit(1);
  }
})();
