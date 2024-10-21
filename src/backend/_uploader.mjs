// src/backend/_uploader.mjs

import fs from "fs";
import path from "path";
import * as Constants from "./constants.mjs";
import { loadEnv } from "./loadEnv.mjs";

loadEnv();

const inputDirectory = process.env.INPUT_DIRECTORY;

if (!inputDirectory) {
  console.error("INPUT_DIRECTORY environment variable is not set");
  process.exit(1);
}

// Get basic infos about the new media files
const files = fs.readdirSync(inputDirectory);
const media = files
  .filter((sourceFile) => !sourceFile.startsWith("."))
  .map((sourceFile) => {
    let name = sourceFile.substring(0, sourceFile.lastIndexOf("."));
    // Rename file if needed
    if (name.endsWith(Constants.RENAME_IDS[1])) {
      name = name
        .replace(Constants.RENAME_IDS[1], "")
        .replace(Constants.RENAME_IDS[0], Constants.REPLACEMENT);
    }
    return {
      name: name,
      sourceFile: sourceFile,
      targetFile: name + Constants.MEDIA_FORMATS.large,
    };
  });
console.log(media);
