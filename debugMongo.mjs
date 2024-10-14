import mongoose from "mongoose";
import { connectDB, Island } from "./server.mjs";

export async function queryAllIslands() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const docs = await Island.find().sort({ dateTime: -1 }).lean();

    console.log(`\nAll Islands in MongoDB:`);
    docs.forEach((doc, index) => {
      console.log(`Island ${index + 1}:`);
      console.log(JSON.stringify(doc, null, 2));
      console.log("-------------------");
    });
    console.log(`Total number of Islands: ${docs.length}`);

    return docs; // Return the documents
  } catch (error) {
    console.error(`Error querying Islands:`, error);
    throw error; // Rethrow the error so it can be caught by the caller
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// If you want to run this file directly
if (import.meta.url === `file://${process.argv[1]}`) {
  queryAllIslands().catch(console.error);
}
