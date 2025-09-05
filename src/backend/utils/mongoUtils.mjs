// src/utils/mongoUtils.mjs

import mongoose from "mongoose";
import logger from "../utils/logger.mjs";
import { connectDB } from "../server.mjs";

/**
 * Executes a MongoDB query within a managed connection lifecycle.
 * Opens a connection before the query, and disconnects after completion.
 *
 * @param {Function} queryCallback - Async function executing the query.
 * @param {string} [modelName="Document"] - Model name used for logging.
 * @param {boolean} [output=false] - Whether to log detailed query results.
 * @returns {Promise<any>} The query result.
 * @throws Throws if DB connection or query fails.
 */
export async function executeMongoQuery(
  queryCallback,
  modelName = "Document",
  output = false
) {
  let connection;
  try {
    // Connect to MongoDB (reuse or create new depending on connectDB implementation)
    connection = await connectDB();

    if (output) logger.info("Connected to MongoDB");

    // Execute the provided query callback
    const result = await queryCallback();

    // Log results if output is enabled
    if (output) {
      logQueryResults(result, modelName);
    }

    return result;
  } catch (error) {
    if (output) {
      logger.error(`Error executing ${modelName} query: ${error.message}`, {
        error,
      });
    }
    throw error;
  } finally {
    // Disconnect from MongoDB to free resources
    // Note: frequent connect/disconnect may cause overhead; consider connection pooling or reuse in high-load contexts
    if (connection) {
      await mongoose.disconnect();
      if (output) logger.info("Disconnected from MongoDB");
    }
  }
}

/**
 * Logs query results based on the type of result.
 * @param {*} result - The result of the query.
 * @param {string} modelName - The model name used for logging.
 */
function logQueryResults(result, modelName) {
  if (Array.isArray(result)) {
    logger.info(`\nAll ${modelName}s in MongoDB:`);
    result.forEach((doc, index) => {
      logger.info(`${modelName} ${index + 1}:`);
      logger.info(JSON.stringify(doc, null, 2));
      logger.info("-------------------");
    });
    logger.info(`Total number of ${modelName}s: ${result.length}`);
  } else if (result && typeof result === "object") {
    logger.info(`\n${modelName} operation result:`);
    logger.info(JSON.stringify(result, null, 2));
  } else {
    logger.info(`\n${modelName} operation result: ${result}`);
  }
}
