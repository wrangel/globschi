// src/backend/dataHandler.mjs

import { Island } from "./models/islandModel.mjs";
import { beautify } from "./metadataProcessor.mjs";

/**
 * Fetches and combines data from MongoDB and local media files.
 * @returns {Promise<Array>} Combined and processed data.
 * @throws {Error} If there's an issue fetching or processing the data.
 */
export async function getCombinedData() {
  try {
    console.log("Fetching data from MongoDB...");
    const mongoData = await fetchMongoData();
    console.log("MongoDB data fetched successfully:", mongoData);

    const combinedData = mongoData.map((item) => ({
      ...item,
      mediaUrl: `/media/${item.filename}`, // Ensure 'filename' exists
    }));
    console.log("Combined data constructed successfully:", combinedData);

    // Optionally process the data further using beautify
    const processedData = await beautify(combinedData);
    console.log("Processed combined data:", processedData);

    return processedData;
  } catch (error) {
    console.error("Error in getCombinedData:", error);
    throw new Error("Failed to fetch or process combined data");
  }
}

/**
 * Fetches data from MongoDB with default sorting by dateTime descending.
 * @returns {Promise<Array>} Data from MongoDB.
 * @throws {Error} If there's an issue fetching data from MongoDB.
 */
async function fetchMongoData() {
  try {
    console.log("Querying MongoDB for Island documents...");
    const data = await Island.find().lean().sort({ dateTime: -1 }).exec();
    console.log("MongoDB query completed. Fetched documents:", data);

    if (!data || data.length === 0) {
      console.warn("No documents found in the Island collection.");
    }

    return data;
  } catch (error) {
    console.error("Error querying MongoDB:", error);
    throw new Error("Failed to fetch data from MongoDB");
  }
}
