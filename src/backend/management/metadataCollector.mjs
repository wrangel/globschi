import ExifReader from "exifreader";
import fs from "fs/promises";
import path from "path";
import readline from "readline";
import logger from "../helpers/logger.mjs";
import {
  CONTRIBUTORS,
  MEDIA_FORMATS,
  MEDIA_PAGES,
  REVERSE_GEO_ADDRESS_COMPONENTS,
  REVERSE_GEO_URL_ELEMENTS,
} from "../constants.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

// Utility Functions

/**
 * Prompts user with a question and returns the answer.
 * @param {string} q - Question to ask.
 * @returns {Promise<string>} - User's answer.
 */
const question = async (q) => {
  const cl = readline.createInterface(process.stdin, process.stdout);
  return new Promise((resolve) => {
    cl.question(q, (answer) => {
      cl.close();
      resolve(answer);
    });
  });
};

/**
 * Extracts the name of a file without its extension.
 * @param {string} fileName - File name to process.
 * @returns {string} - The file name without extension.
 */
const getFileNameWithoutExtension = (fileName) => {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
};

/**
 * Generates an extended string with timestamp.
 * @param {string} initialString - The initial string.
 * @param {string} dateString - The date string in "YYYY:MM:DD HH:MM:SS" format.
 * @returns {string} - Extended string with timestamp.
 */
const generateExtendedString = (initialString, dateString) => {
  try {
    const [datePart, timePart] = dateString.split(" ");
    const [year, month, day] = datePart.split(":");
    const [hours, minutes, seconds] = timePart.split(":");
    const inputDate = new Date(year, month - 1, day, hours, minutes, seconds);
    return `${initialString}_${inputDate
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 14)}`;
  } catch (error) {
    logger.error("Error generating extended string:", { error });
    throw error;
  }
};

/**
 * Converts altitude string to meters above sea level.
 * @param {string} altitudeString - Altitude string.
 * @returns {number} - Altitude in meters.
 */
const getAltitude = (altitudeString) => {
  if (altitudeString.endsWith("m")) return parseFloat(altitudeString);
  const [numerator, denominator] = altitudeString.split("/").map(Number);
  return numerator / denominator;
};

/**
 * Converts GPS coordinates to decimal format.
 * @param {string} coordString - Coordinate string.
 * @param {string} orientation - Orientation (N, S, E, W).
 * @returns {number} - Decimal coordinate.
 */
const getCoordinates = (coordString, orientation) => {
  let coordinate = parseFloat(coordString);
  return ["S", "W"].includes(orientation) ? -coordinate : coordinate;
};

/**
 * Converts timestamp string to Date object.
 * @param {string} str - Timestamp string.
 * @returns {Date} - Date object.
 */
const getDate = (str) => {
  const [year, month, date, hour, min, sec] = str.split(/\D/);
  return new Date(year, month - 1, date, hour, min, sec);
};

// Main Functions

/**
 * Collects media files from the input directory.
 * @returns {Promise<Array>} An array of objects containing information about each media file.
 */
async function collectMedia() {
  const files = await fs.readdir(process.env.INPUT_DIRECTORY);
  return files
    .filter((medium) => !medium.startsWith("."))
    .map((medium) => ({
      originalName: getFileNameWithoutExtension(medium),
      originalMedium: medium,
    }));
}

/**
 * Enhances media objects with user input for author and media type.
 * @param {Array} media - Array of media objects.
 * @returns {Promise<Array>} Enhanced media objects with author and media type.
 */
async function enhanceMediaWithUserInput(media) {
  for (const medium of media) {
    const answer = await question(
      `Author and media type of --> ${medium.originalName} <-- (comma separated): `
    );
    let [author, mediaType] = answer.split(",").map((x) => x.trim());

    medium.author = await validateInput(author, CONTRIBUTORS, "author");
    medium.mediaType = await validateInput(
      mediaType,
      MEDIA_PAGES,
      "media type"
    );
  }
  return media;
}

/**
 * Validates user input against a list of valid options.
 * @param {string} input - User input to validate.
 * @param {Array} validOptions - Array of valid options.
 * @param {string} inputType - Type of input being validated.
 * @returns {Promise<string>} Validated input.
 */
async function validateInput(input, validOptions, inputType) {
  while (!validOptions.includes(input)) {
    input = await question(
      `Please choose one of (${validOptions}) as ${inputType}: `
    );
  }
  return input;
}

/**
 * Enhances media objects with EXIF data.
 * @param {Array} media - Array of media objects.
 * @returns {Promise<Array>} Enhanced media objects with EXIF data.
 */
async function enhanceMediaWithExifData(media) {
  return Promise.all(
    media.map(async (medium) => {
      const exif = await ExifReader.load(
        path.join(process.env.INPUT_DIRECTORY, medium.originalMedium)
      );
      const newName = generateExtendedString(
        medium.originalName,
        exif.DateTimeOriginal.description
      );
      return {
        ...medium,
        newName,
        newMediumOriginal: newName + MEDIA_FORMATS.large,
        newMediumSite: newName + MEDIA_FORMATS.site,
        newMediumSmall: newName + MEDIA_FORMATS.small,
        exif_datetime: exif.DateTimeOriginal.description,
        exif_longitude: getCoordinates(
          exif.GPSLongitude.description,
          exif.GPSLongitudeRef.value[0]
        ),
        exif_latitude: getCoordinates(
          exif.GPSLatitude.description,
          exif.GPSLatitudeRef.value[0]
        ),
        exif_altitude: getAltitude(exif.GPSAltitude.description),
      };
    })
  );
}

/**
 * Enhances media array with geocoding data.
 * @param {Array} mediaArray - Array of media items with longitude and latitude.
 * @returns {Promise<Array>} - Enhanced media array with geocoding data.
 */
async function enhanceMediaWithGeoData(mediaArray) {
  const createReverseGeoUrl = (longitude, latitude) =>
    `${REVERSE_GEO_URL_ELEMENTS[0]}${longitude},${latitude}${REVERSE_GEO_URL_ELEMENTS[1]}${process.env.ACCESS_TOKEN}`;

  const fetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  const extractAddressComponents = (json) => {
    return REVERSE_GEO_ADDRESS_COMPONENTS.reduce((data, component) => {
      data[component] = json.features.find((doc) =>
        doc.id.startsWith(component)
      )?.text;
      return data;
    }, {});
  };

  try {
    const reverseUrls = mediaArray.map((item) =>
      createReverseGeoUrl(item.exif_longitude, item.exif_latitude)
    );

    const geoJsons = await Promise.all(reverseUrls.map(fetchJson));

    const geoData = geoJsons.map(extractAddressComponents);

    return mediaArray.map((item, index) => ({
      ...item,
      geoData: geoData[index],
    }));
  } catch (error) {
    logger.error("Error enhancing media with geo data:", { error });
    throw error;
  }
}

/**
 * Creates Mongoose-compatible metadata and media file information from enhanced media objects.
 * @param {Array} media - Array of enhanced media objects.
 * @returns {Object} Object containing Mongoose-compatible metadata and media file information.
 */
function createProcessedMediaData(media) {
  const mongooseCompatibleMetadata = media.map((medium) => ({
    name: medium.newName,
    type: medium.mediaType,
    author: medium.author,
    dateTimeString: medium.exif_datetime,
    dateTime: getDate(medium.exif_datetime),
    latitude: medium.exif_latitude,
    longitude: medium.exif_longitude,
    altitude: medium.exif_altitude,
    country: medium.geoData.country,
    region: medium.geoData.region,
    location: medium.geoData.place,
    postalCode: medium.geoData.postcode,
    road: medium.geoData.address,
    noViews: 0,
  }));

  const mediaFileInfo = media.map((medium) => ({
    key: medium.originalName,
    originalMedium: medium.originalMedium,
    newMediumOriginal: medium.newMediumOriginal,
    newMediumSite: medium.newMediumSite,
    newMediumSmall: medium.newMediumSmall,
    mediaType: medium.mediaType,
  }));

  return { mongooseCompatibleMetadata, mediaFileInfo };
}

/**
 * Processes media files through collection, user input, EXIF data extraction, and geo-data enhancement.
 * @returns {Promise<Object>} Processed media data including Mongoose-compatible metadata and media file information.
 */
async function processMedia() {
  const media = await collectMedia();

  if (media.length === 0) {
    logger.info("No media to manage");
    return { mongooseCompatibleMetadata: [], mediaFileInfo: [] };
  }

  logger.info(`${media.length} media to manage`);

  const mediaWithUserInput = await enhanceMediaWithUserInput(media);

  const mediaWithExifData = await enhanceMediaWithExifData(mediaWithUserInput);

  const mediaWithGeoData = await enhanceMediaWithGeoData(mediaWithExifData);

  return createProcessedMediaData(mediaWithGeoData);
}

// Exports

export const processedMediaData = await processMedia();

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
