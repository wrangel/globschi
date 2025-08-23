import fs from "fs";
import path from "path";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "../../utils/awsUtils.mjs"; // your existing S3 client import
import logger from "../../utils/logger.mjs";

const BUCKET_NAME = process.env.AWS_BUCKET; // your target bucket name
const SOURCE_DIR = "/Users/matthiaswettstein/Downloads/DRONE/raw"; // TODO
const BASE_DIR = path.join(SOURCE_DIR, "S3");

/**
 * Recursively upload files in directory to S3 with proper key (folder structure)
 */
async function uploadDirectoryToS3(localDir, s3Prefix = "") {
  const entries = await fs.promises.readdir(localDir, { withFileTypes: true });

  // Filter out dot files and folders (like .DS_Store)
  const filteredEntries = entries.filter(
    (entry) => !entry.name.startsWith(".")
  );

  for (const entry of filteredEntries) {
    const fullPath = path.join(localDir, entry.name);
    const s3Key = s3Prefix ? `${s3Prefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      await uploadDirectoryToS3(fullPath, s3Key);
    } else if (entry.isFile()) {
      logger.info(`Uploading file ${fullPath} as ${s3Key}`);
      const fileStream = fs.createReadStream(fullPath);

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: fileStream,
          StorageClass: "INTELLIGENT_TIERING",
          ServerSideEncryption: "AES256",
        },
        queueSize: 4,
        partSize: 5 * 1024 * 1024,
      });

      try {
        await upload.done();
        logger.info(`Uploaded ${s3Key} successfully`);
      } catch (error) {
        logger.error(`Failed to upload ${s3Key}:`, { error: error.stack });
        throw error;
      }
    }
  }
}

async function runUpload() {
  try {
    logger.info(
      `Starting upload of contents of ${BASE_DIR} to S3 bucket ${BUCKET_NAME}`
    );
    await uploadDirectoryToS3(BASE_DIR);
    logger.info("Upload completed successfully");
  } catch (err) {
    logger.error("Error during upload:", { error: err.stack });
  }
}

runUpload();
