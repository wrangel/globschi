import fs from "fs/promises";
import path from "path";
import { Upload } from "@aws-sdk/lib-storage";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "../utils/awsUtils.mjs"; // your existing configured S3 client
import logger from "../utils/logger.mjs";

const BUCKET_NAME = process.env.AWS_BUCKET;

/**
 * Checks if any object exists in S3 with the given prefix (folder)
 * @param {string} bucketName
 * @param {string} prefix - the S3 folder prefix
 * @returns {Promise<boolean>} true if folder has contents
 */
async function folderExistsInS3(bucketName, prefix) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix.endsWith("/") ? prefix : prefix + "/",
    MaxKeys: 1,
  });
  try {
    const data = await s3Client.send(command);
    return data.Contents && data.Contents.length > 0;
  } catch (err) {
    logger.error(
      `Error checking existence of prefix ${prefix} in bucket ${bucketName}: ${err.message}`
    );
    return false;
  }
}

/**
 * Recursively upload all files in localDir to S3 bucket under s3Prefix
 * @param {string} localDir - absolute path of local folder
 * @param {string} s3Prefix - prefix inside S3 bucket (e.g. folder name)
 */
async function uploadDirectoryToS3(localDir, s3Prefix) {
  const entries = await fs.readdir(localDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue; // skip dotfiles

    const fullPath = path.join(localDir, entry.name);
    const s3Key = `${s3Prefix}/${entry.name}`;

    if (entry.isDirectory()) {
      await uploadDirectoryToS3(fullPath, s3Key);
    } else if (entry.isFile()) {
      logger.info(`Uploading ${fullPath} as s3://${BUCKET_NAME}/${s3Key}`);
      const fileStream = (await import("fs")).createReadStream(fullPath);

      const uploader = new Upload({
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
        await uploader.done();
        logger.info(`Uploaded: ${s3Key}`);
      } catch (err) {
        logger.error(`Failed to upload ${s3Key}`, { error: err });
        throw err;
      }
    }
  }
}

/**
 * Uploads the 's3' folder inside the media folder to S3 if it doesn't exist already
 * @param {string} mediaFolderPath - absolute path to media folder (e.g. /.../pa_20230429_121442)
 * @param {string} folderName - folder name to use as S3 prefix (e.g. pa_20230429_121442)
 */
export async function uploadMedia(mediaFolderPath, folderName) {
  const s3FolderPath = path.join(mediaFolderPath, "s3");

  const exists = await folderExistsInS3(BUCKET_NAME, folderName);
  if (exists) {
    logger.info(
      `S3 folder with prefix ${folderName} already exists. Skipping upload.`
    );
    return;
  }

  logger.info(
    `Uploading contents of ${s3FolderPath} to S3 bucket ${BUCKET_NAME} under prefix ${folderName}`
  );
  await uploadDirectoryToS3(s3FolderPath, folderName);
  logger.info(`Completed upload of folder ${folderName}`);
}
