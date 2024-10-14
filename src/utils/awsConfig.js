// src/utils/awsConfig.js
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.REACT_APP_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  },
  region: process.env.REACT_APP_BUCKET_REGION,
});

export default s3Client;
