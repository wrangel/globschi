import { readdir, readFile } from "fs/promises";
import path from "path";
import fetch from "node-fetch"; // for reverse geocoding API calls
import ExifParser from "exif-parser";
import logger from "../utils/logger.mjs";
import {
  REVERSE_GEO_ADDRESS_COMPONENTS,
  REVERSE_GEO_URL_ELEMENTS,
} from "../constants.mjs";

/**
 * Converts altitude string or number to meters.
 * @param {string|number} altitudeValue
 * @returns {number|null}
 */
function getAltitude(altitudeValue) {
  if (typeof altitudeValue === "string") {
    if (altitudeValue.endsWith("m")) return parseFloat(altitudeValue);
    const [num, denom] = altitudeValue.split("/").map(Number);
    if (!isNaN(num) && !isNaN(denom)) return num / denom;
    return null;
  }
  if (typeof altitudeValue === "number") return altitudeValue;
  return null;
}

/**
 * Converts GPS coordinate value and orientation to decimal.
 * @param {string|number} coordValue
 * @param {string} orientation "N", "S", "E", "W"
 * @returns {number}
 */
function getCoordinates(coordValue) {
  if (typeof coordValue === "string" && coordValue.includes("/")) {
    const [num, denom] = coordValue.split("/").map(Number);
    return num / denom;
  }
  return Number(coordValue);
}

/**
 * Converts a string of format "YYYY:MM:DD HH:MM:SS" to Date object
 * @param {string} str
 * @returns {Date|null}
 */
function getDate(str) {
  const [datePart, timePart] = str.split(" ");
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split(":").map(Number);
  const [hour, min, sec] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, min, sec);
}

/**
 * Determines media type based on the number of JPG/JPEG images in the original folder.
 * @param {string} parentDir
 * @returns {Promise<string>}
 */
async function determineMediaType(parentDir) {
  try {
    const originalPath = path.join(parentDir, "original");
    const files = await readdir(originalPath);
    const imageCount = files.filter(
      (file) =>
        file.toLowerCase().endsWith(".jpg") ||
        file.toLowerCase().endsWith(".jpeg")
    ).length;

    if (imageCount <= 5) return "hdr";
    if (imageCount >= 26 && imageCount <= 35) return "pano";
    return "wide_angle";
  } catch (err) {
    console.error(`Error determining media type for ${parentDir}:`, err);
    return "unknown";
  }
}

/**
 * Reverse geocode coordinates to address components using legacy logic.
 * @param {number} longitude
 * @param {number} latitude
 * @returns {Promise<Object>} geoData with country, region, place, postcode, address
 */
async function reverseGeocode(longitude, latitude) {
  const createReverseGeoUrl = (lon, lat) =>
    `${REVERSE_GEO_URL_ELEMENTS[0]}${lon},${lat}${REVERSE_GEO_URL_ELEMENTS[1]}${process.env.ACCESS_TOKEN}`;

  const url = createReverseGeoUrl(longitude, latitude);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();

    const geoData = REVERSE_GEO_ADDRESS_COMPONENTS.reduce((data, component) => {
      data[component] =
        json.features.find((doc) => doc.id.startsWith(component))?.text ?? null;
      return data;
    }, {});

    return geoData;
  } catch (error) {
    logger.error("Reverse geocoding error:", { error });
    return {
      country: null,
      region: null,
      place: null,
      postcode: null,
      address: null,
    };
  }
}

/**
 * Reads EXIF of the first JPEG in the original folder and prints all requested properties including geo data.
 * @param {string} parentDir
 * @param {string} mediaType
 */
async function readExifFromFirstJPEGInOriginal(parentDir, mediaType) {
  try {
    const originalPath = path.join(parentDir, "original");
    const files = await readdir(originalPath);

    const jpgFile = files.find(
      (file) =>
        file.toLowerCase().endsWith(".jpg") ||
        file.toLowerCase().endsWith(".jpeg")
    );
    if (!jpgFile) {
      console.log(`No JPEG file found in ${originalPath}`);
      return;
    }

    const filePath = path.join(originalPath, jpgFile);
    const imgBuffer = await readFile(filePath);

    const parser = ExifParser.create(imgBuffer);
    const exifData = parser.parse();

    let drone = "Unknown";
    if (exifData.tags.Model === "FC7303") drone = "DJI Mini 2";
    else if (exifData.tags.Model === "FC8482") drone = "DJI Mini 4 Pro";

    const type = mediaType;

    const prefixes = { pano: "pa_", hdr: "hd_", wide_angle: "wa_" };
    const prefix = prefixes[type] || "";

    let dateTimeString = "unknown";
    if (exifData.tags.DateTimeOriginal) {
      const d = new Date(exifData.tags.DateTimeOriginal * 1000);
      const pad = (n) => n.toString().padStart(2, "0");
      dateTimeString =
        `${d.getFullYear()}:${pad(d.getMonth() + 1)}:${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    const dateTime =
      dateTimeString === "unknown" ? null : getDate(dateTimeString);

    let name = "";
    if (dateTime) {
      const pad = (n) => n.toString().padStart(2, "0");
      name = `${prefix}${dateTime.getFullYear()}${pad(
        dateTime.getMonth() + 1
      )}${pad(dateTime.getDate())}_${pad(dateTime.getHours())}${pad(
        dateTime.getMinutes()
      )}${pad(dateTime.getSeconds())}`;
    } else {
      name = prefix + "unknown";
    }

    const longitude = getCoordinates(
      exifData.tags.GPSLongitude,
      exifData.tags.GPSLongitudeRef
    );
    const latitude = getCoordinates(
      exifData.tags.GPSLatitude,
      exifData.tags.GPSLatitudeRef
    );
    const altitude = getAltitude(exifData.tags.GPSAltitude);

    // Reverse geocode to get geo info
    const geoData = await reverseGeocode(longitude, latitude);

    // Output to console all props including geo data
    console.log(`File: ${filePath}`);
    console.log("EXIF Tags:", exifData.tags);
    console.log(`drone: ${drone}`);
    console.log(`type: ${type}`);
    console.log(`name: ${name}`);
    console.log(`dateTimeString: ${dateTimeString}`);
    console.log(`dateTime:`, dateTime);
    console.log(`longitude: ${longitude}`);
    console.log(`latitude: ${latitude}`);
    console.log(`altitude: ${altitude}`);
    console.log("geoData:", geoData);
  } catch (err) {
    console.error("Error reading EXIF ", err);
  }
}

const inputDir = process.env.INPUT_DIRECTORY;
if (!inputDir) {
  console.error("Please set the INPUT_DIRECTORY environment variable");
  process.exit(1);
}

(async () => {
  const entries = await readdir(inputDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const folderPath = path.join(inputDir, entry.name);
      console.log("Folder:", entry.name);

      const mediaType = await determineMediaType(folderPath);
      await readExifFromFirstJPEGInOriginal(folderPath, mediaType);
    }
  }
})();
