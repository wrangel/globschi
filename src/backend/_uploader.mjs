// src/backend/_uploader.mjs

import ExifReader from "exifreader";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { Island } from "./server.mjs";
import { executeMongoQuery } from "./queryHelpers.mjs";
import * as Constants from "./constants.mjs";
import { loadEnv } from "./loadEnv.mjs";
import {
  enhanceMediaWithGeoData,
  execPromise,
  generateExtendedString,
  getAltitude,
  getCoordinates,
  getDate,
  question,
  runCli,
  splitFileName,
} from "./helpers.mjs";

loadEnv();

/// A) Collect and upload the metadata

// A1) Collect the media
const media0 = fs
  .readdirSync(process.env.INPUT_DIRECTORY)
  .filter((medium) => !medium.startsWith("."))
  .map((medium) => {
    let { name: originalName, suffix: originalSuffix } = splitFileName(medium);
    return {
      originalName: originalName,
      originalSuffix: originalSuffix,
      originalMedium: medium,
    };
  });

// A2) Enhance the media with user inputs
const noMedia = media0.length;
if (noMedia == 0) {
  console.log("No media to manage");
  process.exit(0);
} else {
  console.log(`${noMedia} media to manage`);
  // Collect user input about authors and type of the media (while is async by nature!)
  let idx = 0;
  while (idx < noMedia) {
    const name = media0[idx].name;
    const answer = await question(
      `Author and media type of --> ${name} <-- (comma separated) : `
    );
    let [author, mediaType] = answer.split(",").map((x) => x.trim());
    // Allow only known authors
    while (!Constants.CONTRIBUTORS.includes(author)) {
      author = await question(
        `Please choose one of (${Constants.CONTRIBUTORS}) as author for --> ${name}  <-- : `
      );
    }
    // Allow only known media types
    while (!Constants.MEDIA_PAGES.includes(mediaType)) {
      mediaType = await question(
        `Please choose one of (${Constants.MEDIA_PAGES}) as media type for --> ${name} <-- : `
      );
    }
    // Add the new info to the media object
    media0[idx].author = author;
    media0[idx].mediaType = mediaType;
    idx += 1;
  }

  // A3) Enhance the media with exif data
  const media1 = await Promise.all(
    media0.map(async (medium) => {
      const exif = await ExifReader.load(
        path.join(process.env.INPUT_DIRECTORY, medium.originalMedium)
      );
      return {
        ...medium,
        newName:
          generateExtendedString(
            medium.originalName,
            exif.DateTimeOriginal.description
          ) + medium.originalSuffix,
        exif_datetime: exif.DateTimeOriginal.description,
        exif_longitude: getCoordinates(
          exif.GPSLongitude.description,
          exif.GPSLongitudeRef.value[0]
        ),
        exif_latitude: getCoordinates(
          exif.GPSLatitude.description,
          exif.GPSLatitudeRef.value[0]
        ),
        exif_altitude: getAltitude(exif.GPSAltitude.description),
      };
    })
  );

  // A4) Enhance the media with geo coded data
  const media2 = await enhanceMediaWithGeoData(media1);

  // A5) Combine everything into the Mongoose compatible metadata (one for each document)
  const media3 = media2.map(function (medium) {
    return {
      name: medium.newName,
      type: medium.mediaType,
      author: medium.author,
      dateTimeString: medium.exif_datetime,
      dateTime: getDate(medium.exif_datetime),
      latitude: medium.exif_latitude,
      longitude: medium.exif_longitude,
      altitude: medium.exif_altitude,
      country: medium.geoData.country,
      region: medium.geoData.region,
      location: medium.geoData.place,
      postalCode: medium.geoData.postcode,
      road: medium.geoData.address,
      noViews: 0,
    };
  });

  // A6) Update documents to MongoDB

  await executeMongoQuery(async () => {
    await Island.insertMany(media3);
    return null; // Return null to indicate no value
  });

  process.exit(0);

  /////////

  /// C) Convert file to .jpeg, copy .jpeg to OneDrive, move .tif to 'done' folder
  await Promise.all(
    media.map(async (fi) => {
      const inputFile = path.join(process.env.INPUT_DIRECTORY, fi.sourceFile);
      // Handle jpegs
      await sharp(inputFile)
        .jpeg({ quality: 100 })
        .withMetadata()
        .toFile(
          path.join(
            process.env.ONEDRIVE_DIRECTORY,
            fi.sourceFile.replace(
              Constants.MEDIA_FORMATS.large,
              Constants.MEDIA_FORMATS.small
            )
          )
        );
      // Handle .tifs
      fs.rename(
        inputFile,
        path.join(process.env.OUTPUT_DIRECTORY, fi.sourceFile),
        function (err) {
          if (err) {
            throw err;
          } else {
            console.log(`Successfully moved ${inputFile}`);
          }
        }
      );
    })
  );

  /// D) Upload media to AWS S3 (requires AWS CLI with proper authentication: Alternative would be an S3 client)
  await Promise.all(
    media.map((fi) =>
      runCli(
        `aws s3 cp ${process.env.OUTPUT_DIRECTORY}${fi.sourceFile} s3://${process.env.ORIGINALS_BUCKET}/${fi.mediaType}/${fi.targetFile}`
      )
    )
  );
}
