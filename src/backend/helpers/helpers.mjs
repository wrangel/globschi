// src/backend/helpers.mjs

import readline from "readline";
import * as Constants from "../constants.mjs";
import { loadEnv } from "../loadEnv.mjs";

// Load environment variables
loadEnv();

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
 * Extracts the name of a file without its extension.
 * @param {string} fileName - File name to process.
 * @returns {string} - The file name without extension.
 */
export function getFileNameWithoutExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
}

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
export const question = async (q) => {
  const cl = readline.createInterface(process.stdin, process.stdout);
  return new Promise((resolve) => {
    cl.question(q, (answer) => {
      cl.close();
      resolve(answer);
    });
  });
};
