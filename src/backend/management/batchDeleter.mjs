import fs from "fs";
import path from "path";
import readline from "readline";
import { deleteS3Objects } from "../helpers/awsHelpers.mjs";

const MATERIAL_FOLDER = path.join(process.cwd(), "Material");
const DELETE_LIST_FILE = path.join(MATERIAL_FOLDER, "deleteObjects.txt");

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

// Main function to execute the deletion process
async function main() {
  try {
    const objectsToDelete = await readDeleteList();
    console.log(`Found ${objectsToDelete.length} objects to delete.`);

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
