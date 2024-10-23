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

// 1) Collect the media
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

// 2) Enhance the media with user inputs
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

  // 3) Enhance the media with exif data
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

  // 4) Enhance the media with geo coded data
  const media2 = await enhanceMediaWithGeoData(media1);

  console.log(media2);
  process.exit(0);

  /////////

  const media = files
    .filter((sourceFile) => !sourceFile.startsWith("."))
    .map((sourceFile) => {
      let name = sourceFile.substring(0, sourceFile.lastIndexOf("."));
      // Rename file if needed
      if (name.endsWith(Constants.RENAME_IDS[1])) {
        name = name
          .replace(Constants.RENAME_IDS[1], "")
          .replace(Constants.RENAME_IDS[0], Constants.REPLACEMENT);
      }
      return {
        name: name,
        sourceFile: sourceFile,
        targetFile: name + Constants.MEDIA_FORMATS.large,
      };
    });

  // Get exif data for the new files
  const base = await Promise.all(
    media.map(async (medium, index) => {
      const exif = await ExifReader.load(
        path.join(process.env.INPUT_DIRECTORY, medium.sourceFile)
      );

      // Generate the new medium name
      const key = generateExtendedString(
        medium.name,
        exif.DateTimeOriginal.description
      );

      // Update the name in the media array
      media[index].targetFile = key;

      return {
        key: key,
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

  // Get the urls for the reverse engineering call
  const reverseUrls1 = base.map(
    (exif) =>
      Constants.REVERSE_GEO_URL_ELEMENTS[0] +
      exif.exif_longitude +
      ", " +
      exif.exif_latitude +
      Constants.REVERSE_GEO_URL_ELEMENTS[1] +
      process.env.ACCESS_TOKEN
  );

  // Get the jsons from the reverse engineering call (Wait on all promises to be resolved)
  const jsons1 = await Promise.all(
    reverseUrls.map(async (reverseUrl) => {
      const resp = await fetch(reverseUrl);
      return await resp.json();
    })
  );

  // Get the reverse geocoding data
  const reverseGeocodingData1 = jsons.map((json) => {
    let data = {};
    Constants.REVERSE_GEO_ADDRESS_COMPONENTS.forEach((addressComponent) => {
      data[addressComponent] = json.features
        .filter((doc) => doc.id.startsWith(addressComponent))
        .map((doc) => doc.text)[0];
    });
    return data;
  });

  /*  Combine everything into the Mongoose compatible metadata (one for each document)
  Note that name, type and author are provided by helper.mjs, and name is used for id'ing the correct document
  */
  const newIslands = media.map(function (medium, i) {
    const b = base[i];
    const rgcd = reverseGeocodingData[i];
    return {
      name: b.key,
      type: medium.mediaType,
      author: medium.author,
      dateTimeString: b.exif_datetime,
      dateTime: getDate(b.exif_datetime),
      latitude: b.exif_latitude,
      longitude: b.exif_longitude,
      altitude: b.exif_altitude,
      country: rgcd.country,
      region: rgcd.region,
      location: rgcd.place,
      postalCode: rgcd.postcode,
      road: rgcd.address,
      noViews: 0,
    };
  });

  /// B) Update MongoDB

  await executeMongoQuery(async () => {
    await Island.insertMany(newIslands);
    return null; // Return null to indicate no value
  });

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
