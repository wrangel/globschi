// src/backend/management/startMongo.mjs

import mongoose from "mongoose";
import logger from "./utils/logger.mjs";
import { orchestrate } from "./management/orchestrate.mjs";

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info("MongoDB connected");

    await orchestrate();

    // Could disconnect here if your app ends here:
    // await mongoose.disconnect();
  } catch (err) {
    logger.error("Failed to connect to MongoDB or run orchestrator:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed");
  process.exit(0);
});

start();
