import mongoose from "mongoose";
import { connectDB, Island } from "./server.mjs";

async function queryAllIslands() {
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
  } catch (error) {
    console.error(`Error querying Islands:`, error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

export { queryAllIslands };
