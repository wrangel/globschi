// src/backend/loadEnv.mjs
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadEnv(forceReload = false, printVars = false) {
  const envPath = resolve(__dirname, "..", "..", ".env"); // Adjust this path as needed

  console.log(`Loading .env file from: ${envPath}`);

  const result = dotenv.config({ path: envPath, override: forceReload });

  if (result.error) {
    console.error("Error loading .env file:", result.error);
    throw result.error;
  } else {
    console.log(".env file loaded successfully");
    if (printVars) {
      console.log("Loaded environment variables:", Object.keys(result.parsed));
    }
  }
}
