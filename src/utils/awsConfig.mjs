// src/utils/awsConfig.mjs
import { S3Client } from "@aws-sdk/client-s3";
import loadEnv from "../../loadEnv.mjs";

loadEnv();

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: process.env.BUCKET_REGION,
});

export { s3Client };
