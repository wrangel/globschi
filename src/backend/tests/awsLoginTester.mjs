// src/backend/management/awsLoginTester.mjs

import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "../helpers/awsHelpers.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

/**
 * Tests AWS login and S3 bucket access.
 * @returns {Promise<void>}
 */
async function testAwsLogin() {
  const bucketName = process.env.SITE_BUCKET;

  if (!bucketName) {
    console.error("SITE_BUCKET environment variable is not set.");
    process.exit(1);
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1,
    });

    console.log(`Attempting to access bucket: ${bucketName}`);
    const response = await s3Client.send(command);

    console.log("Successfully connected to AWS and accessed the bucket.");

    if (response.Contents && response.Contents.length > 0) {
      console.log("Found at least one object in the bucket:");
      console.log(`Key: ${response.Contents[0].Key}`);
      console.log(`Last Modified: ${response.Contents[0].LastModified}`);
      console.log(`Size: ${response.Contents[0].Size} bytes`);
    } else {
      console.log(
        "The bucket is empty or you don't have permission to list its contents."
      );
    }

    // Additional bucket information
    console.log(`Bucket Name: ${response.Name}`);
    console.log(`Prefix: ${response.Prefix || "None"}`);
    console.log(`MaxKeys: ${response.MaxKeys}`);
    console.log(`IsTruncated: ${response.IsTruncated}`);
  } catch (error) {
    console.error("Error connecting to AWS or accessing the bucket:");
    if (error.Code) {
      console.error(`Error Code: ${error.Code}`);
      console.error(`Error Message: ${error.Message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Self-invoking async function to allow top-level await
(async () => {
  try {
    await testAwsLogin();
  } catch (error) {
    console.error("Unexpected error occurred:", error);
    process.exit(1);
  }
})();
