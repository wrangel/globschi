// src/backend/loadEnv.mjs
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadEnv() {
  dotenv.config({ path: resolve(__dirname, ".env") });
}
