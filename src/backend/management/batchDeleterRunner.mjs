// src/backend/batchDeleterRunner.mjs

import readline from "readline";
import fs from "fs/promises";
import path from "path";
import { manageS3Objects } from "./batchDeleter.mjs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runBatchDelete() {
  try {
    // Ask for bucket name
    const bucketName = await new Promise((resolve) => {
      rl.question("Enter the S3 bucket name: ", resolve);
    });

    console.log(
      "Please place your objectsList.json file in the (project root)/Material directory."
    );
    console.log(
      "The file should contain a JSON array of objects in the format:"
    );
    console.log('[{"root_folder": "y", "object": "someFileName"}, ...]');

    // Ask for file type
    const fileType = await new Promise((resolve) => {
      rl.question("Enter the file type/suffix (tif/webp): ", (answer) => {
        const validTypes = ["tif", "webp"];
        if (validTypes.includes(answer)) {
          resolve(answer);
        } else {
          console.error("Invalid file type. Please enter 'tif' or 'webp'.");
          resolve(null); // Handle invalid input
        }
      });
    });

    // Check if fileType is valid before proceeding
    if (!fileType) {
      console.log("Exiting due to invalid file type.");
      rl.close();
      return;
    }

    await new Promise((resolve) => {
      rl.question("Press Enter when you have placed the file... ", resolve);
    });

    // Read and parse the objectsList.json file
    const objectsListPath = path.join(
      process.cwd(),
      "Material",
      "objectsList.json"
    );

    try {
      const objectsListContent = await fs.readFile(objectsListPath, "utf8");
      const objectsList = JSON.parse(objectsListContent); // Parse the JSON content

      console.log(`Proceeding with batch delete for bucket: ${bucketName}`);
      console.log(`Objects to be processed: ${objectsList.length}`);

      // Confirm before proceeding
      const confirm = await new Promise((resolve) => {
        rl.question("Are you sure you want to proceed? (yes/no): ", resolve);
      });

      if (confirm.toLowerCase() === "yes") {
        // Append the chosen suffix to each object if not already present
        const modifiedObjectsList = objectsList.map((item) => ({
          root_folder: item.root_folder,
          object: item.object.endsWith(`.${fileType}`)
            ? item.object
            : `${item.object}.${fileType}`, // Append chosen suffix only if not present
        }));

        console.log("Modified Object List:", modifiedObjectsList); // Debugging log

        await manageS3Objects(bucketName, modifiedObjectsList); // No need to pass fileType here
        console.log("Batch delete completed successfully.");
      } else {
        console.log("Batch delete cancelled.");
      }
    } catch (parseError) {
      console.error("Error parsing objects list:", parseError.message);
    }
  } catch (error) {
    console.error("Error during batch delete:", error);
  } finally {
    rl.close();
  }
}

runBatchDelete();
