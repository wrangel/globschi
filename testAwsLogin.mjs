import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "./src/utils/awsConfig.mjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the root directory
dotenv.config({ path: resolve(__dirname, ".env") });

async function testAwsLogin() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.SITE_BUCKET,
      MaxKeys: 1,
    });
    const response = await s3Client.send(command);
    console.log("Successfully connected to AWS and accessed the bucket.");
    if (response.Contents && response.Contents.length > 0) {
      console.log("Found at least one object in the bucket:");
      console.log(response.Contents[0].Key);
    } else {
      console.log(
        "The bucket is empty or you don't have permission to list its contents."
      );
    }
  } catch (error) {
    console.error("Error connecting to AWS or accessing the bucket:", error);
  }
}

testAwsLogin();
