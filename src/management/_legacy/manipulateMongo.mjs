// src/backend/management/manipulateMongo.mjs

import logger from "../utils/logger.mjs";
import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../utils/mongoUtils.mjs";

// This can be any function you need
async function updateIslandsWithAuthorField() {
  try {
    const result = await executeMongoQuery(
      async () => {
        const updateResult = await Island.updateMany(
          { author: "dance" }, // Match documents where author is "dance"
          { $set: { author: "Anna" } } // Set author to "Anna"
        );

        return updateResult;
      },
      "Island",
      true
    );

    logger.info(
      `Updated ${result.modifiedCount} Island documents with author field`
    );

    // Optionally, fetch and log a few updated documents
    const updatedDocs = await executeMongoQuery(async () => {
      return await Island.find({ author: "Anna" }).limit(5).lean();
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
    await updateIslandsWithAuthorField();
  } catch (error) {
    logger.error("An unexpected error occurred:", { error });
    process.exit(1);
  }
})();
