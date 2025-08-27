import { readdir } from "fs/promises";
import path from "path";

async function listFolders(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        console.log(entry.name); // folder name
        // If you want to recurse into subfolders, call listFolders here
        // await listFolders(path.join(directory, entry.name));
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }
}
// TODO add logger

const inputDir = process.env.INPUT_DIRECTORY;

if (!inputDir) {
  console.error("Please set the INPUT_DIRECTORY environment variable");
  process.exit(1);
}

listFolders(inputDir);
