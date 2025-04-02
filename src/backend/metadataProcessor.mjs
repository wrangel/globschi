// src/backend/metadataProcessor.mjs

import { MEDIA_PAGES } from "./constants.mjs";
import logger from "./helpers/logger.mjs";

/**
 * Beautifies MongoDB data and provides local media URLs.
 * @param {Array} mongoData - Data from MongoDB.
 * @returns {Array} Beautified data.
 * @throws {Error} If there's an issue processing the data.
 */
export const beautify = async (mongoData) => {
  validateInput(mongoData);

  try {
    return mongoData.map((doc) => processDocument(doc));
  } catch (error) {
    logger.error("Error in beautify function:", { error });
    throw new Error("Failed to process and beautify data");
  }
};

/**
 * Validates input array for the beautify function.
 * @param {Array} mongoData - Data from MongoDB.
 * @throws {Error} If input is not an array.
 */
function validateInput(mongoData) {
  if (!Array.isArray(mongoData)) {
    throw new Error("Invalid input: mongoData must be an array");
  }
}

/**
 * Processes a single document to create local media URLs and format metadata.
 * @param {Object} doc - MongoDB document.
 * @returns {Object} Processed document.
 */
function processDocument(doc) {
  const filename = doc.name || "default"; // Default to 'default' if name is missing
  const actualSubfolder = doc.type;
  return {
    id: doc._id.toString(),
    viewer: doc.type === MEDIA_PAGES[1] ? "pano" : "img",
    drone: doc.drone,
    metadata: formatMetadata(doc),
    latitude: doc.latitude,
    longitude: doc.longitude,
    thumbnailUrl: `/thumbnails/${filename}.webp`, // Construct thumbnail URL
    actualUrl: `/${actualSubfolder}/${filename}.webp`, // Construct actual URL
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
  const formattedRoad = formatRoadWithLineBreaks(road, 29);
  const location1 = `${doc.postalCode || ""} ${doc.location || ""}`.trim();
  const location2 = `${doc.region || ""}, ${doc.country || ""}`.trim();

  return [
    formattedDate,
    formattedTime,
    `${doc.altitude ? doc.altitude.toFixed(1) : ""}m above sea level`,
    formattedRoad,
    location1,
    location2,
    `Author: ${doc.author || ""}`,
    `Drone: ${doc.drone || ""}`,
  ]
    .map((item) => (item === undefined || item === "undefined" ? "" : item))
    .filter(Boolean)
    .join("\n");
}

/**
 * Formats road name with line breaks if it exceeds the maximum length.
 * @param {string} road - The road name to format.
 * @param {number} maxLength - The maximum length of each line.
 * @returns {string} Formatted road name with line breaks if necessary.
 */
function formatRoadWithLineBreaks(road, maxLength) {
  if (road.length <= maxLength) {
    return road;
  }

  const words = road.split(" ");
  let currentLine = "";
  const lines = [];

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = "";
      }
      if (word.length > maxLength) {
        // Split long words into smaller chunks
        for (let i = 0; i < word.length; i += maxLength) {
          lines.push(word.substr(i, maxLength));
        }
      } else {
        currentLine = word;
      }
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  }

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines.join("\n");
}
