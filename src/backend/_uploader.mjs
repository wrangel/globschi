// src/backend/_uploader.mjs

import fs from "fs";
import path from "path";

/// 1) Prepare
// Get basic infos about the new media files
const files = fs.readdirSync(process.env.INPUT_DIRECTORY);
