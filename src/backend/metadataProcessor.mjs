// src/backend/metadataProcessor.mjs

import { AUTHOR_PICTURES_PATH, MEDIA_PAGES } from "./constants.mjs";
import logger from "./helpers/logger.mjs";

/**
 * Beautifies and combines MongoDB data with presigned URLs.
 * @param {Array} mongoData - Data from MongoDB.
 * @param {Array} presignedUrls - Presigned URLs from AWS S3.
 * @returns {Array} Combined and beautified data.
 * @throws {Error} If there's an issue processing the data.
 */
export const beautify = async (mongoData, presignedUrls) => {
  validateInput(mongoData, presignedUrls);

  const { intersectedData, onlyInMongo, onlyInAWS } = intersectData(
    mongoData,
    presignedUrls
  );

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
    logger.error("Error in beautify function:", { error });
    throw new Error("Failed to process and beautify data");
  }
};

/**
 * Validates input arrays for the beautify function.
 * @param {Array} mongoData - Data from MongoDB.
 * @param {Array} presignedUrls - Presigned URLs from AWS S3.
 * @throws {Error} If inputs are not arrays.
 */
function validateInput(mongoData, presignedUrls) {
  if (!Array.isArray(mongoData) || !Array.isArray(presignedUrls)) {
    throw new Error(
      "Invalid input: mongoData and presignedUrls must be arrays"
    );
  }
}

/**
 * Intersects MongoDB data with presigned URLs data.
 * @param {Array} mongoData - Data from MongoDB.
 * @param {Array} presignedUrls - Presigned URLs from AWS S3.
 * @returns {Object} Intersected data and items unique to each source.
 */
function intersectData(mongoData, presignedUrls) {
  const mongoNames = new Set(mongoData.map((item) => item.name));
  const awsNames = new Set(presignedUrls.map((item) => item.name));

  const intersectedData = mongoData.filter((mongoItem) =>
    awsNames.has(mongoItem.name)
  );
  const onlyInMongo = [...mongoNames].filter((name) => !awsNames.has(name));
  const onlyInAWS = [...awsNames].filter((name) => !mongoNames.has(name));

  return { intersectedData, onlyInMongo, onlyInAWS };
}

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
    id: doc._id.toString(),
    name: doc.name,
    type: doc.type,
    viewer: doc.type === MEDIA_PAGES[1] ? "pano" : "img",
    author: `${AUTHOR_PICTURES_PATH}${doc.author}.svg`,
    metadata: formatMetadata(doc),
    latitude: doc.latitude,
    longitude: doc.longitude,
    thumbnailUrl: urls.thumbnail || "",
    actualUrl: urls.actual || "",
  };
}

/**
 * Formats metadata into a single string.
 * @param {Object} doc - MongoDB document.
 * @returns {string} Formatted metadata string.
 */
function formatMetadata(doc) {
  const dateTime = new Date(doc.dateTime);
  const formattedDate = dateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });

  const road = doc.road ? doc.road.replace(/^,\s*/, "") : "";
  const location = `${doc.postalCode} ${doc.location}, ${doc.region}, ${doc.country}`;

  return [
    formattedDate,
    formattedTime,
    `in ${doc.altitude.toFixed(1)}m altitude`,
    road,
    location,
  ]
    .filter(Boolean)
    .join("\n");
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
  logger.info("Data Processing Summary:");
  logger.info(`  MongoDB elements: ${mongoData.length}`);
  logger.info(`  AWS S3 elements: ${presignedUrls.length}`);
  logger.info(`  Intersected elements: ${intersectedData.length}`);
  logger.info(`  Elements only in MongoDB: ${onlyInMongo.length}`);
  logger.info(`  Elements only in AWS S3: ${onlyInAWS.length}`);

  if (onlyInMongo.length > 0) {
    logger.info("Elements missing from AWS S3:", onlyInMongo);
  }

  if (onlyInAWS.length > 0) {
    logger.info("Elements missing from MongoDB:", onlyInAWS);
  }
}

/**
 * Formats date for display.
 * @param {Date} date - Date object.
 * @returns {string} - Formatted date string.
 */
export const prepareDate = (date) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    timeZone: "CET",
    timeZoneName: "short",
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
};
