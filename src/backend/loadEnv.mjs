// src/backend/loadEnv.mjs

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import logger from "./helpers/logger.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadEnv(forceReload = false, printVars = false) {
  const env = process.env.NODE_ENV || "development";

  let envPath;
  if (env === "production") {
    logger.info("Loading production environment from .env.production file");
    envPath = resolve(__dirname, "..", "..", ".env.production");
  } else {
    logger.info("Loading development environment from .env file");
    envPath = resolve(__dirname, "..", "..", ".env");
  }

  logger.info(`Attempting to load environment file from: ${envPath}`);

  const result = dotenv.config({ path: envPath, override: forceReload });

  if (result.error) {
    logger.error("Failed to load environment file:", {
      message: result.error.message,
    });
    throw new Error(
      "Could not load environment file. Please check the file path and format."
    );
  }

  logger.info(`${env} environment file loaded successfully.`);

  if (printVars) {
    logger.info("Loaded environment variables:");
    Object.entries(process.env).forEach(([key, value]) => {
      logger.info(`  ${key}: ${value}`);
    });
  }
}
