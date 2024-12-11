import fs from "fs/promises";
import path from "path";
import readline from "readline";
import chardet from "chardet";
import iconv from "iconv-lite";
import { deleteS3Objects, downloadS3Object } from "../helpers/awsHelpers.mjs";

const DELETE_LIST_FILE = path.join(
  process.cwd(),
  "Material",
  "deleteObjects.txt"
);
const DOWNLOAD_DIRECTORY = process.env.DOWNLOAD_DIRECTORY;

async function readDeleteList() {
  try {
    const buffer = await fs.readFile(DELETE_LIST_FILE);
    const detectedEncoding = chardet.detect(buffer);

    let data;
    if (detectedEncoding === "ISO-8859-1") {
      data = iconv.decode(buffer, "ISO-8859-1");
    } else {
      data = buffer.toString(detectedEncoding);
    }

    const lines = data.split("\n");

    const objectsToDelete = lines
      .map((line) => line.replace(/\/\/.*$/, "").trim())
      .filter((line) => line)
      .map((line) => line.replace(/^['"]|['"]$/g, ""))
      .filter((line) => line.endsWith(".tif"));

    if (objectsToDelete.length === 0) {
      throw new Error("No valid entries found in the file");
    }

    return objectsToDelete.map((key) => ({ Key: key }));
  } catch (error) {
    throw new Error(`Error reading or parsing file: ${error.message}`);
  }
}

// Function to prompt for confirmation
async function confirmDeletion() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "Are you sure you want to delete these objects? (yes/no): ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "yes");
      }
    );
  });
}

// Function to check if file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Function to download images
async function downloadImages(objectsToDelete) {
  for (const { Key } of objectsToDelete) {
    const fileName = path.basename(Key);
    const localPath = path.join(DOWNLOAD_DIRECTORY, fileName);

    // Check if the file already exists
    const exists = await fileExists(localPath);
    if (!exists) {
      console.log(`Downloading ${fileName}...`);
      await downloadS3Object(process.env.ORIGINALS_BUCKET, Key, localPath);
    } else {
      console.log(`${fileName} already downloaded.`);
    }
  }
}

// Main function to execute the deletion process
async function main() {
  if (!DOWNLOAD_DIRECTORY) {
    console.error("DOWNLOAD_DIRECTORY environment variable is not set.");
    return;
  }

  try {
    const objectsToDelete = await readDeleteList();
    console.log(`Found ${objectsToDelete.length} objects to delete.`);

    // Download images before deletion
    await downloadImages(objectsToDelete);

    const confirmed = await confirmDeletion();
    if (!confirmed) {
      console.log("Deletion cancelled.");
      return;
    }

    const result = await deleteS3Objects(objectsToDelete);
    console.log(`Deletion result:`, result);
  } catch (error) {
    console.error(error);
  }
}

// Execute the main function
main();
