// src/backend/metadataProcessor.mjs

import { AUTHOR_PICTURES_PATH, MEDIA_PAGES } from "./constants.mjs";
import { prepareDate } from "./helpers/helpers.mjs";

/**
 * Beautifies and combines MongoDB data with presigned URLs.
 * @param {Array} mongoData - Data from MongoDB.
 * @param {Array} presignedUrls - Presigned URLs from AWS S3.
 * @returns {Array} Combined and beautified data.
 * @throws {Error} If there's an issue processing the data.
 */
export const beautify = async (mongoData, presignedUrls) => {
  if (!Array.isArray(mongoData) || !Array.isArray(presignedUrls)) {
    throw new Error(
      "Invalid input: mongoData and presignedUrls must be arrays"
    );
  }

  const mongoNames = new Set(mongoData.map((item) => item.name));
  const awsNames = new Set(presignedUrls.map((item) => item.name));

  // Create an intersection based on the 'name' property
  const intersectedData = mongoData.filter((mongoItem) =>
    awsNames.has(mongoItem.name)
  );

  // Perform bookkeeping
  const onlyInMongo = [...mongoNames].filter((name) => !awsNames.has(name));
  const onlyInAWS = [...awsNames].filter((name) => !mongoNames.has(name));

  logBookkeepingInfo(
    mongoData,
    presignedUrls,
    intersectedData,
    onlyInMongo,
    onlyInAWS
  );

  try {
    return intersectedData.map((doc) => processDocument(doc, presignedUrls));
  } catch (error) {
    console.error("Error in beautify function:", error);
    throw new Error("Failed to process and beautify data");
  }
};

/**
 * Processes a single document, combining it with presigned URL data.
 * @param {Object} doc - MongoDB document.
 * @param {Array} presignedUrls - Presigned URLs from AWS S3.
 * @returns {Object} Processed document.
 */
function processDocument(doc, presignedUrls) {
  const urls =
    presignedUrls.find((element) => element.name === doc.name)?.urls || {};

  return {
    id: doc._id.toString(), // Convert ObjectId to string
    name: doc.name,
    type: doc.type,
    viewer: doc.type === MEDIA_PAGES[1] ? "pano" : "img",
    author: `${AUTHOR_PICTURES_PATH}${doc.author}.svg`,
    dateTime: prepareDate(doc.dateTime),
    latitude: doc.latitude,
    longitude: doc.longitude,
    altitude: `${doc.altitude.toFixed(1)}m`,
    country: doc.country,
    region: doc.region,
    location: doc.location,
    postalCode: doc.postalCode,
    road: doc.road ? `, above ${doc.road}` : "",
    noViews: 0,
    thumbnailUrl: urls.thumbnail || "",
    actualUrl: urls.actual || "",
  };
}

/**
 * Logs bookkeeping information about the data processing.
 * @param {Array} mongoData - Original MongoDB data.
 * @param {Array} presignedUrls - Original presigned URLs data.
 * @param {Array} intersectedData - Data after intersection.
 * @param {Array} onlyInMongo - Items only in MongoDB.
 * @param {Array} onlyInAWS - Items only in AWS.
 */
function logBookkeepingInfo(
  mongoData,
  presignedUrls,
  intersectedData,
  onlyInMongo,
  onlyInAWS
) {
  console.log("Data Processing Summary:");
  console.log(`  MongoDB elements: ${mongoData.length}`);
  console.log(`  AWS S3 elements: ${presignedUrls.length}`);
  console.log(`  Intersected elements: ${intersectedData.length}`);
  console.log(`  Elements only in MongoDB: ${onlyInMongo.length}`);
  console.log(`  Elements only in AWS S3: ${onlyInAWS.length}`);

  if (onlyInMongo.length > 0) {
    console.log("Elements missing from AWS S3:", onlyInMongo);
  }
  if (onlyInAWS.length > 0) {
    console.log("Elements missing from MongoDB:", onlyInAWS);
  }
}
