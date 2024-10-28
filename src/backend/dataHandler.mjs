// src/backend/dataHandler.mjs

import { Island } from "./models/islandModel.mjs";
import { getUrls } from "./signedUrlServer.mjs";
import { beautify } from "./metadataProcessor.mjs";

/**
 * Fetches and combines data from MongoDB and AWS S3.
 * @returns {Promise<Array>} Combined and processed data.
 * @throws {Error} If there's an issue fetching or processing the data.
 */
export async function getCombinedData() {
  try {
    // Fetch data from MongoDB and S3 concurrently
    const [mongoData, presignedUrls] = await Promise.all([
      fetchMongoData(),
      getUrls(),
    ]);

    // Combine and process the data
    const combinedData = await beautify(mongoData, presignedUrls);
    return combinedData;
  } catch (error) {
    console.error("Error in getCombinedData:", error);
    throw new Error("Failed to fetch or process combined data");
  }
}

/**
 * Fetches data from MongoDB.
 * @returns {Promise<Array>} Data from MongoDB.
 * @throws {Error} If there's an issue fetching data from MongoDB.
 */
async function fetchMongoData() {
  try {
    const data = await Island.find().lean().exec();
    if (!data || data.length === 0) {
      console.warn("No data found in MongoDB");
    }
    return data;
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    throw new Error("Failed to fetch data from MongoDB");
  }
}
