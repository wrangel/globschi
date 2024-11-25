// src/backend/helpers/mongoHelpers.mjs

import mongoose from "mongoose";
import logger from "../helpers/logger.mjs";
import { connectDB } from "../server.mjs";

/**
 * Executes a MongoDB query and handles connection/disconnection.
 * @param {Function} queryCallback - Async function containing the query to execute.
 * @param {string} [modelName="Document"] - Name of the model being queried (for logging).
 * @param {boolean} [output=false] - Whether to log output or not.
 * @returns {Promise<any>} - Result of the query.
 * @throws {Error} If there's an issue with the database operation.
 */
export async function executeMongoQuery(
  queryCallback,
  modelName = "Document",
  output = false
) {
  let connection;
  try {
    connection = await connectDB();
    if (output) logger.info("Connected to MongoDB");

    const result = await queryCallback();

    if (output) {
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
      }
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
    if (connection) {
      await mongoose.disconnect();
      if (output) logger.info("Disconnected from MongoDB");
    }
  }
}
