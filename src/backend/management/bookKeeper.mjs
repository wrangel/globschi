import { ListObjectsCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../awsConfigurator.mjs";
import * as Constants from "../constants.mjs";
import { getId } from "../helpers.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

async function listBucketContents(bucketName, adapt = false) {
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

const originalMedia = await listBucketContents(
  process.env.ORIGINALS_BUCKET,
  true
);
const siteFiles = await listBucketContents(process.env.SITE_BUCKET, true);

// Get actual image Site files
const actualSiteMedia = siteFiles.filter(
  (siteFile) => siteFile.path.indexOf(Constants.THUMBNAIL_ID) == -1
);

// Get thumbnail image Site files
const thumbnailSiteMedia = siteFiles.filter(
  (siteFile) => siteFile.path.indexOf(Constants.THUMBNAIL_ID) > -1
);

console.log(actualSiteMedia);
process.exit(0);

///////////

const a = await getCurrentStatus();
console.log(a);

// Get current outdated media
async function getCurrentStatus() {
  // List Original files on Saint Patrick Island (which are the master) - Await for Promise
  const originalMedia = (
    await s3Client.send(
      new ListObjectsCommand({ Bucket: process.env.ORIGINALS_BUCKET })
    )
  ).Contents.map((originalFile) => {
    let path = originalFile.Key;
    return { key: getId(path), path: path };
  });

  // Get actual image Site files
  const actualSiteMedia = siteFiles.filter(
    (siteFile) => siteFile.path.indexOf(Constants.THUMBNAIL_ID) == -1
  );

  // Get thumbnail image Site files
  const thumbnailSiteMedia = siteFiles.filter(
    (siteFile) => siteFile.path.indexOf(Constants.THUMBNAIL_ID) > -1
  );

  // Await Island collection entries (for outdated entries)
  const islandDocs = await queryAllIslands().catch(console.error);
  const islandNames = islandDocs.map((doc) => doc.name);

  console.log(islandDocs);
  return Promise.all([
    originalMedia,
    actualSiteMedia,
    thumbnailSiteMedia,
    islandNames,
  ]);
}
