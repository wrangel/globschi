// src/backend/tests/mongoDbPerformanceTest.mjs

import { connectDB, closeDB } from "../utils/mongodbConnection.mjs";
import { Island } from "../models/islandModel.mjs";

async function runExplain() {
  try {
    await connectDB();

    const explainResult = await Island.find()
      .sort({ dateTime: -1 })
      .explain("executionStats");

    console.log(JSON.stringify(explainResult, null, 2));
  } catch (err) {
    console.error("Error running explain:", err);
  } finally {
    await closeDB();
  }
}

runExplain();
