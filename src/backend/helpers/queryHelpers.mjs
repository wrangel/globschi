// src/backend/helpers/asyncHelpers.mjs

import { ListObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../awsConfigurator.mjs";
import mongoose from "mongoose";
import { connectDB } from "../server.mjs";

export async function executeMongoQuery(queryCallback) {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Execute the passed query callback and await its result
    const result = await queryCallback();

    // If the result is an array of documents, log them
    if (Array.isArray(result)) {
      console.log(`\nAll Islands in MongoDB:`);
      result.forEach((doc, index) => {
        console.log(`Island ${index + 1}:`);
        console.log(JSON.stringify(doc, null, 2));
        console.log("-------------------");
      });
      console.log(`Total number of Islands: ${result.length}`);
    }

    return result; // Return the result of the query
  } catch (error) {
    console.error(`Error executing query:`, error);
    throw error; // Rethrow the error so it can be caught by the caller
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

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
