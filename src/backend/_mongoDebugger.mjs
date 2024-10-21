import mongoose from "mongoose";
import { connectDB, Island } from "./server.mjs";

export async function executeMongoQuery(queryCallback) {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Execute the passed query callback and await its result
    const result = await queryCallback();

    // If the result is an array of documents, log them
    if (Array.isArray(result)) {
      console.log(`\nAll Islands in MongoDB:`);
      result.forEach((doc, index) => {
        console.log(`Island ${index + 1}:`);
        console.log(JSON.stringify(doc, null, 2));
        console.log("-------------------");
      });
      console.log(`Total number of Islands: ${result.length}`);
    }

    return result; // Return the result of the query
  } catch (error) {
    console.error(`Error executing query:`, error);
    throw error; // Rethrow the error so it can be caught by the caller
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

const docs = await executeMongoQuery(async () => {
  return await Island.find().sort({ dateTime: -1 }).lean();
});

console.log(docs);
