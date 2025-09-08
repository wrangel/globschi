// src/backend/management/bookKeeper.mjs

import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import logger from "../utils/logger.mjs";
import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../utils/mongoUtils.mjs";
import { connectDB, closeDB } from "../utils/mongodbConnection.mjs";

const s3Client = new S3Client({ region: process.env.AWS_REGION });

async function listTopLevelFolders(bucketName) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Delimiter: "/", // group by top-level "folders"
  });
  const response = await s3Client.send(command);
  const prefixes = response.CommonPrefixes || [];
  return prefixes.map((p) => p.Prefix.replace(/\/$/, ""));
}

async function deleteS3Folders(bucketName, folders) {
  if (folders.length === 0) {
    logger.info("No S3 folders to delete.");
    return;
  }
  for (const folder of folders) {
    logger.info(`Deleting S3 folder and contents: ${folder}/`);
    let continuationToken = undefined;
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: folder + "/",
        ContinuationToken: continuationToken,
      });
      const listResponse = await s3Client.send(listCommand);
      continuationToken = listResponse.IsTruncated
        ? listResponse.NextContinuationToken
        : undefined;
      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteParams = {
          Bucket: bucketName,
          Delete: {
            Objects: listResponse.Contents.map((obj) => ({ Key: obj.Key })),
            Quiet: false,
          },
        };
        const deleteCommand = new DeleteObjectsCommand(deleteParams);
        await s3Client.send(deleteCommand);
      }
    } while (continuationToken);
  }
}

async function main() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info("MongoDB connected");

    const s3Folders = await listTopLevelFolders(process.env.AWS_BUCKET);
    const mongoDocs = await executeMongoQuery(
      () => Island.find().lean(),
      "Island"
    );

    const s3Set = new Set(s3Folders);
    const mongoSet = new Set(mongoDocs.map((doc) => doc.name));

    // Elements only in S3 (folders not in Mongo)
    const s3Only = s3Folders.filter((folder) => !mongoSet.has(folder));
    // Elements only in Mongo (docs not in S3)
    const mongoOnly = mongoDocs
      .filter((doc) => !s3Set.has(doc.name))
      .map((doc) => doc.name);

    logger.info("Folders only in S3:", s3Only);
    logger.info("Documents only in Mongo:", mongoOnly);

    if (s3Only.length === 0) {
      logger.info("No S3 folders to delete — all match MongoDB documents.");
    } else {
      logger.warn(
        `Deleting S3 folders with no matching Mongo document: ${s3Only.join(
          ", "
        )}`
      );

      await deleteS3Folders(process.env.AWS_BUCKET, s3Only);

      logger.info(`Deleted ${s3Only.length} orphaned S3 folders.`);
    }
  } catch (error) {
    logger.error("Error deleting S3 folders missing in MongoDB:", { error });
  } finally {
    // Close MongoDB connection gracefully when done
    await closeDB();
    logger.info("MongoDB connection closed");
  }
}

main().catch((err) => {
  logger.error("Uncaught error in bookKeeper:", { error: err });
});
