// src/backend/utils/mongodbConnection.mjs

import mongoose from "mongoose";
import logger from "../utils/logger.mjs";

/**
 * Establishes a connection to MongoDB using Mongoose with recommended options:
 * - useNewUrlParser: true to use new URL parser
 * - useUnifiedTopology: true to opt in to the new topology engine
 * - serverSelectionTimeoutMS: 10000 to avoid hanging indefinitely on slow networks
 * - keepAlive: true and keepAliveInitialDelay: 300000 to maintain connection health
 *
 * Logs success or detailed error during connection.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGODB_DB_USER}:${encodeURIComponent(
        process.env.MONGODB_DB_PASSWORD
      )}@${process.env.MONGODB_SERVER}/${
        process.env.MONGODB_DB
      }?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
        keepAlive: true,
        keepAliveInitialDelay: 300000,
      }
    );
    logger.info("Successfully connected to MongoDB");
  } catch (err) {
    logger.error("MongoDB connection error:", err);
    throw err;
  }
};

/**
 * Gracefully closes the MongoDB connection.
 * Logs success or failure to close the connection.
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  } catch (err) {
    logger.error("Failed to close MongoDB connection:", err);
  }
};

export { connectDB, closeDB };
