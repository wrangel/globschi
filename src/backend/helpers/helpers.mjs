// src/backend/helpers.mjs

import { exec } from "child_process";
import readline from "readline";
import util from "util";
import * as Constants from "../constants.mjs";
import { loadEnv } from "../loadEnv.mjs";

loadEnv();

export async function enhanceMediaWithGeoData(mediaArray) {
  // Function to create reverse geocoding URL
  const createReverseGeoUrl = (longitude, latitude) =>
    `${Constants.REVERSE_GEO_URL_ELEMENTS[0]}${longitude},${latitude}${Constants.REVERSE_GEO_URL_ELEMENTS[1]}${process.env.ACCESS_TOKEN}`;

  // Function to fetch JSON from URL
  const fetchJson = async (url) => {
    const response = await fetch(url);
    return await response.json();
  };

  // Function to extract address components from JSON
  const extractAddressComponents = (json) => {
    let data = {};
    Constants.REVERSE_GEO_ADDRESS_COMPONENTS.forEach((component) => {
      data[component] = json.features
        .filter((doc) => doc.id.startsWith(component))
        .map((doc) => doc.text)[0];
    });
    return data;
  };

  // Generate URLs for reverse geocoding
  const reverseUrls = mediaArray.map((item) =>
    createReverseGeoUrl(item.exif_longitude, item.exif_latitude)
  );

  // Fetch all geocoding data
  const geoJsons = await Promise.all(reverseUrls.map(fetchJson));

  // Process geocoding data
  const geoData = geoJsons.map(extractAddressComponents);

  // Combine original media data with geocoding data
  return mediaArray.map((item, index) => ({
    ...item,
    geoData: geoData[index],
  }));
}

// Promisify child process
export const execPromise = util.promisify(exec);

// Generate name suffix
export function generateExtendedString(initialString, dateString) {
  // Parse the input date string
  const [datePart, timePart] = dateString.split(" ");
  const [year, month, day] = datePart.split(":");
  const [hours, minutes, seconds] = timePart.split(":");

  // Create a Date object
  const inputDate = new Date(year, month - 1, day, hours, minutes, seconds);

  // Format the timestamp
  const timestamp =
    inputDate.getFullYear() +
    String(inputDate.getMonth() + 1).padStart(2, "0") +
    String(inputDate.getDate()).padStart(2, "0") +
    String(inputDate.getHours()).padStart(2, "0") +
    String(inputDate.getMinutes()).padStart(2, "0") +
    String(inputDate.getSeconds()).padStart(2, "0");

  // Combine all parts
  return `${initialString}_${timestamp}`;
}

// Converts the altitude into meter-above-sea
export const getAltitude = (altitudeString) => {
  let altitude;
  if (altitudeString.endsWith("m")) {
    altitude = parseFloat(altitudeString.replace("m", ""));
  } else {
    const components = altitudeString
      .split("/")
      .map((component) => parseFloat(component));
    altitude = components[0] / components[1];
  }
  return altitude;
};

// Get decimal GPS coordinates
export const getCoordinates = (coordString, orientation) => {
  let coordinate = parseFloat(coordString);
  if (["S", "W"].indexOf(orientation) > -1) {
    coordinate = -coordinate;
  }
  return coordinate;
};

/*  Converts the timestamp string into a GMT / Local date (that is what exifr is doing wrong!)
    https://stackoverflow.com/questions/43083993/javascript-how-to-convert-exif-date-time-data-to-timestamp
*/
export const getDate = (str) => {
  const [year, month, date, hour, min, sec] = str.split(/\D/);
  return new Date(year, month - 1, date, hour, min, sec);
};

export const getId = (path) => {
  return path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
};

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

// Create a readline question
export const question = function (q) {
  // Create a readline interface
  const cl = readline.createInterface(process.stdin, process.stdout);
  return new Promise((res, rej) => {
    cl.question(q, (answer) => {
      res(answer);
    });
  });
};

// Run command against Mongo Atlas
export const runCli = (cmd) => {
  execPromise(cmd, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
};

export function splitFileName(fileName) {
  // Find the last dot in the file name
  const lastDotIndex = fileName.lastIndexOf(".");

  // If there's no dot, return the whole file name as the name and null as the suffix
  if (lastDotIndex === -1) {
    return { name: fileName, suffix: null };
  }

  // Extract the name and the suffix
  const name = fileName.substring(0, lastDotIndex);
  const suffix = fileName.substring(lastDotIndex);
  return { name, suffix };
}
