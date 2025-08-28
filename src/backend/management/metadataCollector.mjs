import { readdir, readFile } from "fs/promises";
import path from "path";
import fetch from "node-fetch"; // for reverse geocoding API calls
import ExifParser from "exif-parser";
import logger from "../utils/logger.mjs";
import {
  CONTRIBUTORS,
  REVERSE_GEO_ADDRESS_COMPONENTS,
  REVERSE_GEO_URL_ELEMENTS,
} from "../constants.mjs";

// Utility: prompt user for input
import readline from "readline";
const question = async (q) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(q, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

async function validateInput(input, validOptions, inputType) {
  while (!validOptions.includes(input)) {
    input = await question(
      `Please choose one of (${validOptions.join(", ")}) as ${inputType}: `
    );
  }
  return input;
}

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

function getCoordinates(coordValue) {
  if (typeof coordValue === "string" && coordValue.includes("/")) {
    const [num, denom] = coordValue.split("/").map(Number);
    return num / denom;
  }
  return Number(coordValue);
}

function getDate(str) {
  const [datePart, timePart] = str.split(" ");
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split(":").map(Number);
  const [hour, min, sec] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, min, sec);
}

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

async function reverseGeocode(longitude, latitude) {
  const createReverseGeoUrl = (lon, lat) =>
    `${REVERSE_GEO_URL_ELEMENTS[0]}${lon},${lat}${REVERSE_GEO_URL_ELEMENTS[1]}${process.env.ACCESS_TOKEN}`;
  const url = createReverseGeoUrl(longitude, latitude);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();

    const geoData = REVERSE_GEO_ADDRESS_COMPONENTS.reduce((data, component) => {
      const value =
        json.features.find((doc) => doc.id.startsWith(component))?.text ?? null;
      if (component === "address") data.road = value;
      else if (component === "place") data.location = value;
      else if (component === "postcode") data.postalCode = value;
      else data[component] = value;
      return data;
    }, {});

    return geoData;
  } catch (error) {
    logger.error("Reverse geocoding error:", { error });
    return {
      country: null,
      region: null,
      location: null,
      postalCode: null,
      road: null,
    };
  }
}

async function readExifFromFirstJPEGInOriginal(parentDir, mediaType, author) {
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
      return null;
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

    const longitude = getCoordinates(exifData.tags.GPSLongitude);
    const latitude = getCoordinates(exifData.tags.GPSLatitude);
    const altitude = getAltitude(exifData.tags.GPSAltitude);

    const geoData = await reverseGeocode(longitude, latitude);

    // Return all data for this element
    return {
      originalName: path.basename(parentDir),
      drone,
      type,
      name,
      dateTimeString,
      dateTime,
      longitude,
      latitude,
      altitude,
      geoData,
      filePath,
      author,
    };
  } catch (err) {
    console.error("Error reading EXIF ", err);
    return null;
  }
}

async function promptAuthorForMedia(mediaName) {
  const authorInput = await question(`Author of --> ${mediaName} <--: `);
  return await validateInput(authorInput.trim(), CONTRIBUTORS, "author");
}

// Single media processing function for one folder
export async function processSingleMedia(mediaDirPath) {
  const mediaType = await determineMediaType(mediaDirPath);
  const originalName = path.basename(mediaDirPath);
  const author = await promptAuthorForMedia(originalName);
  const exifData = await readExifFromFirstJPEGInOriginal(
    mediaDirPath,
    mediaType,
    author
  );
  if (!exifData) return null;

  // Prepare mongoose compatible
  const metadata = {
    name: exifData.name,
    type: exifData.type,
    author: exifData.author,
    drone: exifData.drone,
    dateTimeString: exifData.dateTimeString,
    dateTime: exifData.dateTime,
    latitude: exifData.latitude,
    longitude: exifData.longitude,
    altitude: exifData.altitude,
    country: exifData.geoData.country,
    region: exifData.geoData.region,
    location: exifData.geoData.location,
    postalCode: exifData.geoData.postalCode,
    road: exifData.geoData.road,
    noViews: 0,
  };

  // Optional media file info if needed
  const fileInfo = {
    key: originalName,
    // Add whatever file info needed here
  };

  return { metadata, fileInfo };
}
