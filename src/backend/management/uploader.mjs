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

    // Read image file as Buffer
    const filePath = path.join(bearbeitetPath, jpgFile);
    const imgBuffer = await readFile(filePath);

    // Parse EXIF data
    const parser = ExifParser.create(imgBuffer);
    const exifData = parser.parse();

    console.log(`EXIF data for ${filePath}:`, exifData.tags);
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
  // List folders:
  const entries = await readdir(inputDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const folderPath = path.join(inputDir, entry.name);
      console.log("Folder:", entry.name);
      await readExifFromFirstJPEGInBearbeitet(folderPath);
    }
  }
})();
