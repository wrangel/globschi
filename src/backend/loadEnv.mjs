// src/backend/loadEnv.mjs

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import logger from "./helpers/logger.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Loads environment variables from a .env file.
 * @param {boolean} [forceReload=false] - Whether to force reload of environment variables.
 * @param {boolean} [printVars=false] - Whether to print loaded environment variables.
 * @throws {Error} If there's an error loading the .env file.
 */
export function loadEnv(forceReload = false, printVars = false) {
  const envPath = resolve(__dirname, "..", "..", ".env"); // Adjust this path as needed

  logger.info(`Attempting to load .env file from: ${envPath}`);

  const result = dotenv.config({ path: envPath, override: forceReload });

  if (result.error) {
    console.error("Failed to load .env file:", result.error.message);
    throw new Error(
      "Could not load .env file. Please check the file path and format."
    );
  }

  logger.info(".env file loaded successfully.");

  if (printVars && result.parsed) {
    logger.info("Loaded environment variables:");
    Object.entries(result.parsed).forEach(([key, value]) => {
      logger.info(`  ${key}: ${value}`);
    });
  }
}
