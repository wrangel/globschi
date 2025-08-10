// src/backend/tests/awsLoginTester.mjs

import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import logger from "../helpers/logger.mjs";
import { s3Client } from "../helpers/awsHelpers.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

/**
 * Tests AWS login and S3 bucket access.
 * @returns {Promise<void>}
 */
async function testAwsLogin() {
  const bucketName = process.env.AWS_BUCKET_SITE;

  if (!bucketName) {
    logger.error("AWS_BUCKET_SITE environment variable is not set.");
    process.exit(1);
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1,
    });

    logger.info(`Attempting to access bucket: ${bucketName}`);
    const response = await s3Client.send(command);

    logger.info("Successfully connected to AWS and accessed the bucket.");

    if (response.Contents && response.Contents.length > 0) {
      logger.info("Found at least one object in the bucket:");
      logger.info(`Key: ${response.Contents[0].Key}`);
      logger.info(`Last Modified: ${response.Contents[0].LastModified}`);
      logger.info(`Size: ${response.Contents[0].Size} bytes`);
    } else {
      logger.info(
        "The bucket is empty or you don't have permission to list its contents."
      );
    }

    // Additional bucket information
    logger.info(`Bucket Name: ${response.Name}`);
    logger.info(`Prefix: ${response.Prefix || "None"}`);
    logger.info(`MaxKeys: ${response.MaxKeys}`);
    logger.info(`IsTruncated: ${response.IsTruncated}`);
  } catch (error) {
    logger.error("Error connecting to AWS or accessing the bucket:");

    if (error.Code) {
      logger.error(`Error Code: ${error.Code}`);
      logger.error(`Error Message: ${error.Message}`);
    } else {
      logger.error(error);
    }

    process.exit(1);
  }
}

// Self-invoking async function to allow top-level await
(async () => {
  try {
    await testAwsLogin();
  } catch (error) {
    logger.error("Unexpected error occurred:", { error });
    process.exit(1);
  }
})();
