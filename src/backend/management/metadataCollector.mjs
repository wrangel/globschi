// src/backend/management/metadataCollector.mjs

import ExifReader from "exifreader";
import fs from "fs/promises";
import path from "path";
import * as Constants from "../constants.mjs";
import { loadEnv } from "../loadEnv.mjs";
import {
  enhanceMediaWithGeoData,
  generateExtendedString,
  getAltitude,
  getCoordinates,
  getDate,
  question,
  getFileNameWithoutExtension,
} from "../helpers/helpers.mjs";

loadEnv();

/**
 * Collects media files from the input directory.
 * @returns {Promise<Array>} An array of objects containing information about each media file.
 */
async function collectMedia() {
  const files = await fs.readdir(process.env.INPUT_DIRECTORY);
  return files
    .filter((medium) => !medium.startsWith("."))
    .map((medium) => {
      const originalName = getFileNameWithoutExtension(medium);
      return { originalName, originalMedium: medium };
    });
}

/**
 * Enhances media objects with user input for author and media type.
 * @param {Array} media - Array of media objects.
 * @returns {Promise<Array>} Enhanced media objects with author and media type.
 */
async function enhanceMediaWithUserInput(media) {
  for (const medium of media) {
    const answer = await question(
      `Author and media type of --> ${medium.originalName} <-- (comma separated) : `
    );
    let [author, mediaType] = answer.split(",").map((x) => x.trim());

    medium.author = await validateInput(
      author,
      Constants.CONTRIBUTORS,
      "author"
    );
    medium.mediaType = await validateInput(
      mediaType,
      Constants.MEDIA_PAGES,
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
        newMediumOriginal: newName + Constants.MEDIA_FORMATS.large,
        newMediumSite: newName + Constants.MEDIA_FORMATS.site,
        newMediumSmall: newName + Constants.MEDIA_FORMATS.small,
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
 * Creates Mongoose-compatible metadata from enhanced media objects.
 * @param {Array} media - Array of enhanced media objects.
 * @returns {Array} Mongoose-compatible metadata objects.
 */
function createMongooseCompatibleMetadata(media) {
  return media.map((medium) => ({
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
}

/**
 * Processes media files through collection, user input, EXIF data extraction, and geo-data enhancement.
 * @returns {Promise<Array>} Processed media metadata ready for Mongoose.
 */
async function processMedia() {
  const media = await collectMedia();

  if (media.length === 0) {
    console.log("No media to manage");
    return [];
  }

  console.log(`${media.length} media to manage`);

  const mediaWithUserInput = await enhanceMediaWithUserInput(media);
  const mediaWithExifData = await enhanceMediaWithExifData(mediaWithUserInput);
  const mediaWithGeoData = await enhanceMediaWithGeoData(mediaWithExifData);
  console.log(mediaWithGeoData);
  return createMongooseCompatibleMetadata(mediaWithGeoData);
}

export const processedMedia = await processMedia();

//originalMedium: '001_0001.tif',
