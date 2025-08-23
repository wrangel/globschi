// src/backend/tests/mongoDebugger.mjs

/**
 * mongoDebugger.mjs
 *
 * Script to fetch and log Island documents from MongoDB for debugging.
 * Allows configuring limit, sorting field, and sort order.
 * Run this script with:
 *   node --env-file=.env src/backend/tests/mongoDebugger.mjs
 */

import logger from "../utils/logger.mjs";
import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../utils/mongoUtils.mjs";

/**
 * Fetches and logs Island documents from MongoDB.
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of documents to retrieve (default: 10)
 * @param {string} options.sortField - Field to sort by (default: "dateTime")
 * @param {number} options.sortOrder - Sort order, 1 for ascending, -1 for descending (default: -1)
 * @returns {Promise<void>}
 */
async function debugIslands(options = {}) {
  const { limit = 10, sortField = "dateTime", sortOrder = -1 } = options;

  try {
    // Use utility to execute query within monitored context/logging
    const docs = await executeMongoQuery(async () => {
      return await Island.find()
        .sort({ [sortField]: sortOrder })
        .limit(limit)
        .lean(); // Return plain JS objects instead of Mongoose docs
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

/**
 * Self-invoking async wrapper to run debugIslands with example options
 */
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
