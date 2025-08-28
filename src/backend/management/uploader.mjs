import { readdir, readFile } from "fs/promises";
import path from "path";
import ExifParser from "exif-parser";

async function listFolders(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        console.log(entry.name);
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }
}

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

    // "drone" property from Model
    let drone = "Unknown";
    if (exifData.tags.Model === "FC7303") drone = "DJI Mini 2";
    else if (exifData.tags.Model === "FC8482") drone = "DJI Mini 4 Pro";

    // "type" is mediaType argument
    const type = mediaType;

    // name: prefix + YYYYMMdd_hhmmss
    let prefix = "";
    if (type === "pano") prefix = "pa_";
    else if (type === "hdr") prefix = "hd_";
    else if (type === "wide_angle") prefix = "wa_";
    else prefix = "";

    let timestampStr = "unknown";
    if (exifData.tags.DateTimeOriginal) {
      const d = new Date(exifData.tags.DateTimeOriginal * 1000);
      const pad = (n) => n.toString().padStart(2, "0");
      timestampStr =
        d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        "_" +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        pad(d.getSeconds());
    }

    const name = `${prefix}${timestampStr}`;

    // Log all
    console.log(`EXIF data for ${filePath}:`, exifData.tags);
    console.log(`type: ${type}`);
    console.log(`drone: ${drone}`);
    console.log(`name: ${name}`);
  } catch (err) {
    console.error("Error reading EXIF ", err);
  }
}

async function determineMediaType(parentDir) {
  try {
    const originalPath = path.join(parentDir, "original");
    const files = await readdir(originalPath);

    // Count only image files (jpg and jpeg)
    const imageCount = files.filter(
      (file) =>
        file.toLowerCase().endsWith(".jpg") ||
        file.toLowerCase().endsWith(".jpeg")
    ).length;

    if (imageCount <= 5) {
      return "hdr";
    } else if (imageCount >= 26 && imageCount <= 35) {
      return "pano";
    } else {
      return "wide_angle";
    }
  } catch (err) {
    console.error(`Error determining media type for ${parentDir}:`, err);
    return "unknown";
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

      // Determine type first
      const mediaType = await determineMediaType(folderPath);

      // Read EXIF from first JPEG and print required properties
      await readExifFromFirstJPEGInOriginal(folderPath, mediaType);
    }
  }
})();
