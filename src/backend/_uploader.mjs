// src/backend/_uploader.mjs

import fs from "fs";
import path from "path";
import { loadEnv } from "./loadEnv.mjs";

loadEnv();

const inputDirectory = process.env.INPUT_DIRECTORY;

console.log(inputDirectory);
process.exit(0);
if (!inputDirectory) {
  console.error("INPUT_DIRECTORY environment variable is not set");
  process.exit(1);
}

// Get basic infos about the new media files
const files = fs.readdirSync(inputDirectory);
