import fs from "fs/promises";
import path from "path";
import AdmZip from "adm-zip";
import sharp from "sharp";

const PARENT_DIR = "/Users/matthiaswettstein/Downloads/_gut"; // TODO

async function processFolders() {
  const folders = await fs.readdir(PARENT_DIR, { withFileTypes: true });

  for (const folder of folders) {
    if (!folder.isDirectory()) continue;

    const folderName = folder.name;
    const bearbeitenPath = path.join(PARENT_DIR, folderName, "Bearbeitungen");
    const zipPath = path.join(bearbeitenPath, "project-title.zip");
    const extractPath = path.join(bearbeitenPath, "project-title");

    try {
      // a) unzip project-title.zip into 'project-title' folder
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);
      console.log(`[${folderName}]: Extracted project-title.zip`);

      // b) delete project-title.zip
      await fs.rm(zipPath);
      console.log(`[${folderName}]: Deleted project-title.zip`);

      // c) get 'tiles' folder in extraction path
      const appFilesPath = path.join(extractPath, "app-files");
      const tilesPath = path.join(appFilesPath, "tiles");

      // d) find the only subfolder inside tiles and rename it to folderName
      const tilesSubfolders = (
        await fs.readdir(tilesPath, { withFileTypes: true })
      ).filter((d) => d.isDirectory());
      if (tilesSubfolders.length !== 1) {
        console.warn(
          `[${folderName}]: Expected exactly one subfolder inside tiles, found ${tilesSubfolders.length}. Skipping.`
        );
        continue;
      }
      const oldTilesSubfolder = path.join(tilesPath, tilesSubfolders[0].name);
      const renamedTilesFolder = path.join(bearbeitenPath, folderName);

      // e) delete preview.jpg inside oldTilesSubfolder if exists
      const previewPath = path.join(oldTilesSubfolder, "preview.jpg");
      try {
        await fs.rm(previewPath);
        console.log(`[${folderName}]: Deleted preview.jpg`);
      } catch {}

      // If the renamed destination already exists, delete it
      try {
        await fs.rm(renamedTilesFolder, { recursive: true, force: true });
        console.log(
          `[${folderName}]: Deleted existing folder ${renamedTilesFolder}`
        );
      } catch {}

      // Rename the tiles subfolder to folderName inside Bearbeitungen
      await fs.rename(oldTilesSubfolder, renamedTilesFolder);
      console.log(`[${folderName}]: Renamed tiles subfolder to ${folderName}`);

      // f) the folder is already moved directly into Bearbeitungen by renaming steps above

      // g) delete the extractPath folder (project-title folder now empty)
      await fs.rm(extractPath, { recursive: true, force: true });
      console.log(`[${folderName}]: Deleted project-title folder`);

      // h) create the WebP thumbnail from the single JPG in Bearbeitungen
      const bearbeitenFiles = await fs.readdir(bearbeitenPath);
      const jpgFile = bearbeitenFiles.find((f) => /\.jpe?g$/i.test(f));
      if (!jpgFile) {
        console.warn(
          `[${folderName}]: No JPG found for thumbnail in Bearbeitungen.`
        );
        continue;
      }
      const inputPath = path.join(bearbeitenPath, jpgFile);
      const outputPath = path.join(bearbeitenPath, "thumbnail.webp");

      await sharp(inputPath)
        .resize({
          width: 2000,
          height: 1300,
          fit: "inside",
          position: sharp.strategy.attention,
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      console.log(`[${folderName}]: Created thumbnail.webp from JPG.`);
    } catch (err) {
      console.error(`[${folderName}]: Error processing folder: ${err.message}`);
    }
  }
}

processFolders().catch(console.error);
