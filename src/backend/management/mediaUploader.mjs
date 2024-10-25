// src/backend/management/mediaUploader.mjs

import { Island } from "../models/islandModel.mjs";
import { executeMongoQuery } from "../helpers/mongoHelpers.mjs";
import { processedMediaData } from "./metadataCollector.mjs";

console.log(processedMediaData);

process.exit(0);

// 6) Update documents to MongoDB

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
