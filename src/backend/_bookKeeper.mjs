import { ListObjectsCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./awsConfigurator.mjs";
import * as Constants from "./constants.mjs";
import { queryAllIslands } from "./mongoDebugger.mjs";

const helpers = await import("./helpers.mjs");
const { getId } = helpers;

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
  // Get Site files - Await for Promise
  const siteFiles = (
    await s3Client.send(
      new ListObjectsCommand({ Bucket: process.env.SITE_BUCKET })
    )
  ).Contents.map((siteFile) => {
    let path = siteFile.Key;
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
