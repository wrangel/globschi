// src/backend/helpers/mongoHelpers.mjs

import mongoose from "mongoose";
import { connectDB } from "../server.mjs";

/**
 * Executes a MongoDB query and handles connection/disconnection.
 * @param {Function} queryCallback - Async function containing the query to execute.
 * @param {string} [modelName="Document"] - Name of the model being queried (for logging).
 * @returns {Promise<any>} - Result of the query.
 * @throws {Error} If there's an issue with the database operation.
 */
export async function executeMongoQuery(queryCallback, modelName = "Document") {
  let connection;
  try {
    connection = await connectDB();
    console.log("Connected to MongoDB");

    const result = await queryCallback();

    if (Array.isArray(result)) {
      console.log(`\nAll ${modelName}s in MongoDB:`);
      result.forEach((doc, index) => {
        console.log(`${modelName} ${index + 1}:`);
        console.log(JSON.stringify(doc, null, 2));
        console.log("-------------------");
      });
      console.log(`Total number of ${modelName}s: ${result.length}`);
    } else if (result && typeof result === "object") {
      console.log(`\n${modelName} operation result:`);
      console.log(JSON.stringify(result, null, 2));
    }

    return result;
  } catch (error) {
    console.error(`Error executing ${modelName} query:`, error);
    throw error;
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}

/**
 * Executes multiple MongoDB queries in a single connection session.
 * @param {Function[]} queryCallbacks - Array of async functions containing queries to execute.
 * @returns {Promise<any[]>} - Array of results from the queries.
 * @throws {Error} If there's an issue with any database operation.
 */
export async function executeBatchMongoQueries(queryCallbacks) {
  let connection;
  try {
    connection = await connectDB();
    console.log("Connected to MongoDB");

    const results = await Promise.all(
      queryCallbacks.map((callback) => callback())
    );

    return results;
  } catch (error) {
    console.error("Error executing batch queries:", error);
    throw error;
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}
