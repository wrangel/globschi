import { Island } from "./models/islandModel.mjs";
import { beautify } from "./metadataProcessor.mjs";

/**
 * Fetches and combines data from MongoDB and local media files.
 * @returns {Promise<Array>} Combined and processed data.
 * @throws {Error} If there's an issue fetching or processing the data.
 */
export async function getCombinedData() {
  try {
    // Fetch data from MongoDB
    const mongoData = await fetchMongoData();

    // Add media URLs based on filenames stored in MongoDB
    const combinedData = mongoData.map((item) => ({
      ...item,
      mediaUrl: `/media/${item.filename}`, // Replace 'filename' with the actual field in your schema
    }));

    // Optionally process the data further using beautify
    const processedData = await beautify(combinedData);
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
    // Fetch data sorted by dateTime in descending order
    const data = await Island.find().lean().sort({ dateTime: -1 }).exec();
    if (!data || data.length === 0) {
      console.warn("No data found in MongoDB");
    }
    return data;
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    throw new Error("Failed to fetch data from MongoDB");
  }
}
