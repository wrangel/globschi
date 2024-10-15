// src/backend/dataHandler.mjs
import { Island } from "./server.mjs"; // Import your Mongoose model
import { getUrls } from "./signedUrlServer.mjs";
import { beautify } from "./metadataProcessor.mjs";

export async function getCombinedData() {
  try {
    // Fetch data from MongoDB
    const mongoData = await Island.find().lean();

    // Fetch presigned URLs from AWS S3
    const presignedUrls = await getUrls();

    // Combine and process the data
    const combinedData = await beautify(mongoData, presignedUrls);

    console.log(combinedData);
    process.exit(0); /////////////

    return combinedData;
  } catch (error) {
    console.error("Error in getCombinedData:", error);
    throw error;
  }
}
