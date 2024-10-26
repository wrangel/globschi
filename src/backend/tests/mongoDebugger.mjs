import logger from "../helpers/logger.mjs";
import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../helpers/mongoHelpers.mjs";

/**
 * Fetches and logs Island documents from MongoDB.
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of documents to retrieve
 * @param {string} options.sortField - Field to sort by
 * @param {number} options.sortOrder - Sort order (1 for ascending, -1 for descending)
 */
async function debugIslands(options = {}) {
  const { limit = 10, sortField = "dateTime", sortOrder = -1 } = options;

  try {
    const docs = await executeMongoQuery(async () => {
      return await Island.find()
        .sort({ [sortField]: sortOrder })
        .limit(limit)
        .lean();
    }, "Island");

    logger.info(`Retrieved ${docs.length} Island documents:`);
    docs.forEach((doc, index) => {
      logger.info(`\nIsland ${index + 1}:`);
      logger.info(JSON.stringify(doc, null, 2));
    });

    logger.info(`\nTotal number of Islands retrieved: ${docs.length}`);
  } catch (error) {
    logger.error("Error fetching Island documents:", { error });
  }
}

// Self-invoking async function to allow top-level await
(async () => {
  try {
    await debugIslands({
      limit: 5, // Retrieve only 5 documents
      sortField: "dateTime",
      sortOrder: -1, // Sort in descending order
    });
  } catch (error) {
    logger.error("An unexpected error occurred:", { error });
    process.exit(1);
  }
})();
