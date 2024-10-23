// helpers.mjs

import { exec } from "child_process";
import readline from "readline";
import util from "util";

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
  const suffix = fileName.substring(lastDotIndex + 1); // Get the substring after the dot
  return { name, suffix };
}
