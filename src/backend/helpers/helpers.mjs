// src/backend/helpers.mjs

import { exec } from "child_process";
import readline from "readline";
import util from "util";
import * as Constants from "../constants.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

/**
 * Enhances media array with geocoding data.
 * @param {Array} mediaArray - Array of media items with longitude and latitude.
 * @returns {Promise<Array>} - Enhanced media array with geocoding data.
 */
export async function enhanceMediaWithGeoData(mediaArray) {
  const createReverseGeoUrl = (longitude, latitude) =>
    `${Constants.REVERSE_GEO_URL_ELEMENTS[0]}${longitude},${latitude}${Constants.REVERSE_GEO_URL_ELEMENTS[1]}${process.env.ACCESS_TOKEN}`;

  const fetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  const extractAddressComponents = (json) => {
    return Constants.REVERSE_GEO_ADDRESS_COMPONENTS.reduce(
      (data, component) => {
        data[component] = json.features.find((doc) =>
          doc.id.startsWith(component)
        )?.text;
        return data;
      },
      {}
    );
  };

  const reverseUrls = mediaArray.map((item) =>
    createReverseGeoUrl(item.exif_longitude, item.exif_latitude)
  );

  const geoJsons = await Promise.all(reverseUrls.map(fetchJson));
  const geoData = geoJsons.map(extractAddressComponents);

  return mediaArray.map((item, index) => ({
    ...item,
    geoData: geoData[index],
  }));
}

export const execPromise = util.promisify(exec);

/**
 * Generates an extended string with timestamp.
 * @param {string} initialString - The initial string.
 * @param {string} dateString - The date string in "YYYY:MM:DD HH:MM:SS" format.
 * @returns {string} - Extended string with timestamp.
 */
export function generateExtendedString(initialString, dateString) {
  const [datePart, timePart] = dateString.split(" ");
  const [year, month, day] = datePart.split(":");
  const [hours, minutes, seconds] = timePart.split(":");

  const inputDate = new Date(year, month - 1, day, hours, minutes, seconds);
  const timestamp = inputDate.toISOString().replace(/[-:T]/g, "").slice(0, 14);

  return `${initialString}_${timestamp}`;
}

/**
 * Converts altitude string to meters above sea level.
 * @param {string} altitudeString - Altitude string.
 * @returns {number} - Altitude in meters.
 */
export const getAltitude = (altitudeString) => {
  if (altitudeString.endsWith("m")) {
    return parseFloat(altitudeString);
  }
  const [numerator, denominator] = altitudeString.split("/").map(Number);
  return numerator / denominator;
};

/**
 * Converts GPS coordinates to decimal format.
 * @param {string} coordString - Coordinate string.
 * @param {string} orientation - Orientation (N, S, E, W).
 * @returns {number} - Decimal coordinate.
 */
export const getCoordinates = (coordString, orientation) => {
  let coordinate = parseFloat(coordString);
  return ["S", "W"].includes(orientation) ? -coordinate : coordinate;
};

/**
 * Converts timestamp string to Date object.
 * @param {string} str - Timestamp string.
 * @returns {Date} - Date object.
 */
export const getDate = (str) => {
  const [year, month, date, hour, min, sec] = str.split(/\D/);
  return new Date(year, month - 1, date, hour, min, sec);
};

/**
 * Extracts ID from file path.
 * @param {string} path - File path.
 * @returns {string} - Extracted ID.
 */
export const getId = (path) =>
  path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));

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

/**
 * Prompts user with a question and returns the answer.
 * @param {string} q - Question to ask.
 * @returns {Promise<string>} - User's answer.
 */
export const question = (q) => {
  const cl = readline.createInterface(process.stdin, process.stdout);
  return new Promise((resolve) => {
    cl.question(q, (answer) => {
      cl.close();
      resolve(answer);
    });
  });
};

/**
 * Runs a command against Mongo Atlas.
 * @param {string} cmd - Command to run.
 */
export const runCli = async (cmd) => {
  try {
    const { stdout, stderr } = await execPromise(cmd);
    if (stderr) console.error(`stderr: ${stderr}`);
    console.log(stdout);
  } catch (error) {
    console.error(`error: ${error.message}`);
  }
};

/**
 * Splits a file name into name and suffix.
 * @param {string} fileName - File name to split.
 * @returns {Object} - Object with name and suffix.
 */
export function splitFileName(fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex === -1
    ? { name: fileName, suffix: null }
    : {
        name: fileName.substring(0, lastDotIndex),
        suffix: fileName.substring(lastDotIndex),
      };
}
