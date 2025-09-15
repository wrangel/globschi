// src/backend/tests/mongoDbPerformanceTest.mjs
// Run with nodemon --env-file=.env ./src/backend/tests/mongoDbPerformanceTest.mjs

import mongoose from "mongoose";
import { Island } from "../models/islandModel.mjs";

async function runExplain() {
  await mongoose.connect(process.env.MONGODB_URI);

  const explainResult = await Island.find()
    .sort({ dateTime: -1 })
    .explain("executionStats");

  console.log(JSON.stringify(explainResult, null, 2));

  await mongoose.disconnect();
}

runExplain().catch(console.error);
