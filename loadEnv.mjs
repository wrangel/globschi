// loadEnv.mjs
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, ".env") });

export default function loadEnv() {
  // This function doesn't need to do anything,
  // as dotenv.config() is called when this module is imported
}
