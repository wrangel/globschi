import fs from "fs";
import path from "path";
import sharp from "sharp";

const BASE_DIR = "/Users/matthiaswettstein/Downloads/DRONE/PAN/_In Gallerie"; // TODO

async function convertTiffsToPng() {
  const subfolders = await fs.promises.readdir(BASE_DIR, {
    withFileTypes: true,
  });

  for (const folder of subfolders) {
    if (!folder.isDirectory()) continue;

    const folderPath = path.join(BASE_DIR, folder.name);
    const files = await fs.promises.readdir(folderPath);

    // Filter TIFF files
    const tiffFiles = files.filter((f) => /\.tiff?$/i.test(f));

    if (tiffFiles.length !== 1) {
      console.warn(
        `Folder "${folder.name}" contains ${tiffFiles.length} TIFF files, skipping.`
      );
      continue; // skip to next folder
    }

    // Then process tiffFiles[0] only

    for (const tiffFile of tiffFiles) {
      try {
        const tiffPath = path.join(folderPath, tiffFile);
        const baseName = path.parse(tiffFile).name;
        const pngPath = path.join(folderPath, `${baseName}.png`);

        await sharp(tiffPath).png().toFile(pngPath);
        console.log(`Converted ${tiffFile} to PNG in folder ${folder.name}`);
      } catch (error) {
        console.error(
          `Error converting ${tiffFile} in folder ${folder.name}:`,
          error
        );
      }
    }
  }
}

convertTiffsToPng()
  .then(() => console.log("TIFF to PNG conversion finished"))
  .catch((err) => console.error("Error processing folders:", err));
