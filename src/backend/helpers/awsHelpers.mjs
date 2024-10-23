// src/backend/helpers/awsHelpers.mjs

import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../awsConfigurator.mjs";
import { getId } from "../helpers/helpers.mjs";

export async function listBucketContents(bucketName, adapt = false) {
  try {
    const command = new ListObjectsCommand({ Bucket: bucketName });
    const response = await s3Client.send(command);

    if (!response.Contents) {
      console.log(`No contents found in bucket: ${bucketName}`);
      return [];
    }

    if (adapt) {
      // Adapt: true - Transform the response
      return response.Contents.map((file) => {
        let path = file.Key;
        return { key: getId(path), path: path };
      });
    } else {
      // Adapt: false - Return the raw response
      return response.Contents;
    }
  } catch (error) {
    console.error(`Error listing contents of bucket ${bucketName}:`, error);
    throw error;
  }
}
