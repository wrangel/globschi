// testAwsLogin.mjs
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client } from "../awsConfig.mjs";
import loadEnv from "../loadEnv.mjs";

loadEnv();

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
