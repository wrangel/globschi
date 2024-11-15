import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import logger from "./helpers/logger.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadEnv(forceReload = false, printVars = false) {
  const env = process.env.NODE_ENV || "development";

  if (env === "production") {
    logger.info("Loading production environment from vault");
    dotenv.config({ path: ".env.vault" });
    logger.info(`Loaded environment variables from vault using DOTENV_KEY`);
  } else {
    const envPath = resolve(__dirname, "..", "..", ".env");
    logger.info(`Attempting to load .env file from: ${envPath}`);

    const result = dotenv.config({ path: envPath, override: forceReload });

    if (result.error) {
      logger.error("Failed to load .env file:", {
        message: result.error.message,
      });
      throw new Error(
        "Could not load .env file. Please check the file path and format."
      );
    }

    logger.info(".env file loaded successfully for development.");
  }

  if (printVars) {
    logger.info("Loaded environment variables:");
    Object.entries(process.env).forEach(([key, value]) => {
      logger.info(`  ${key}: ${value}`);
    });
  }
}
