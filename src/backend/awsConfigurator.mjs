// src/backend/awsConfigurator.mjs

import { S3Client } from "@aws-sdk/client-s3";
import { loadEnv } from "./loadEnv.mjs";

// Load environment variables
loadEnv();

// Validate required environment variables
const requiredEnvVars = ["ACCESS_KEY", "SECRET_ACCESS_KEY", "BUCKET_REGION"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

/**
 * Creates and configures an S3 client.
 * @returns {S3Client} Configured S3 client
 */
function createS3Client() {
  return new S3Client({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION,
    // Optional: Add custom retry strategy
    maxAttempts: 3,
  });
}

// Create the S3 client
const s3Client = createS3Client();

export { s3Client };

// Optional: Export a function to create new client instances if needed
export function getNewS3Client() {
  return createS3Client();
}
