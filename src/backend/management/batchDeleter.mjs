import fs from "fs/promises";
import path from "path";
import readline from "readline";
import { deleteS3Objects, downloadS3Object } from "../helpers/awsHelpers.mjs";

const MATERIAL_FOLDER = path.join(process.cwd(), "Material");
const DELETE_LIST_FILE = path.join(MATERIAL_FOLDER, "deleteObjects.txt");
const DOWNLOAD_DIRECTORY = process.env.DOWNLOAD_DIRECTORY;

// Function to read and parse the delete list
async function readDeleteList() {
  return new Promise((resolve, reject) => {
    fs.readFile(DELETE_LIST_FILE, "utf8", (err, data) => {
      if (err) {
        return reject(`Error reading file: ${err.message}`);
      }
      try {
        // Remove comments and parse JSON-like structure
        const cleanedData = data
          .replace(/\/\/.*$/gm, "") // Remove comments
          .replace(/[\[\]]/g, "") // Remove brackets
          .split(",")
          .map((line) => line.trim().replace(/^['"]|['"]$/g, "")) // Trim and remove quotes
          .filter((line) => line); // Filter out empty lines

        const invalidEntries = cleanedData.filter(
          (item) => !item.endsWith(".tif")
        );
        if (invalidEntries.length > 0) {
          return reject(`Invalid entries found: ${invalidEntries.join(", ")}`);
        }

        const objectsToDelete = cleanedData.map((key) => ({ Key: key }));
        resolve(objectsToDelete);
      } catch (parseError) {
        reject(`Error parsing file: ${parseError.message}`);
      }
    });
  });
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
    const localPath = path.join(DOWNLOAD_DIRECTORY, Key);

    // Check if the file already exists
    const exists = await fileExists(localPath);
    if (!exists) {
      console.log(`Downloading ${Key}...`);
      await downloadS3Object(process.env.ORIGINALS_BUCKET, Key, localPath);
    } else {
      console.log(`${Key} already downloaded.`);
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
