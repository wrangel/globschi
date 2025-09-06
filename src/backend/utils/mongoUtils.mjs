import logger from "../utils/logger.mjs";

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
  try {
    // Execute the provided query callback
    const result = await queryCallback();

    // Log results if output is enabled
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
  }
}
