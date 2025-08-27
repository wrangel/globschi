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

async function readExifFromFirstJPEGInBearbeitet(parentDir) {
  try {
    const bearbeitetPath = path.join(parentDir, "bearbeitet");
    const files = await readdir(bearbeitetPath);

    const jpgFile = files.find(
      (file) =>
        file.toLowerCase().endsWith(".jpg") ||
        file.toLowerCase().endsWith(".jpeg")
    );
    if (!jpgFile) {
      console.log(`No JPEG file found in ${bearbeitetPath}`);
      return;
    }

    const filePath = path.join(bearbeitetPath, jpgFile);
    const imgBuffer = await readFile(filePath);

    const parser = ExifParser.create(imgBuffer);
    const exifData = parser.parse();

    console.log(`EXIF data for ${filePath}:`, exifData.tags);
  } catch (err) {
    console.error("Error reading EXIF ", err);
  }
}

async function determineMediaType(parentDir) {
  try {
    const originalPath = path.join(parentDir, "original");
    const files = await readdir(originalPath);

    // Count only image files (consider jpg, jpeg, png based on your context, here we consider .jpg and .jpeg)
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

      // Read EXIF from bearbeitet
      await readExifFromFirstJPEGInBearbeitet(folderPath);

      // Determine and log media type from original
      const mediaType = await determineMediaType(folderPath);
      console.log(`Media type for folder ${entry.name}: ${mediaType}`);
    }
  }
})();
