import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { beautify } from "./src/utils/metadataProcessor.mjs";
import { getUrls } from "./src/utils/serveSignedUrls.mjs";
import { queryAllIslands } from "./debugMongo.mjs";

dotenv.config();

const app = express();
const PORT = process.env.DB_PORT || 8091;

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.set("strictQuery", false);
const connectDB = () =>
  mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.SERVER}/${process.env.DB}?retryWrites=true&w=majority`
  );

// Create Mongoose Island Schema
const islandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    required: true,
    type: String,
  },
  author: {
    type: String,
    required: true,
  },
  dateTimeString: {
    required: true,
    type: String,
  },
  dateTime: {
    required: true,
    type: Date,
  },
  latitude: {
    required: true,
    type: Number,
  },
  longitude: {
    required: true,
    type: Number,
  },
  altitude: {
    required: true,
    type: Number,
  },
  country: {
    required: true,
    type: String,
  },
  region: {
    required: true,
    type: String,
  },
  location: {
    required: true,
    type: String,
  },
  postalCode: {
    type: String,
  },
  road: String,
  noViews: {
    required: true,
    type: Number,
    min: 0,
  },
});

// Create Mongoose Island Model
const Island = mongoose.model("Island", islandSchema);

// Basic route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// API route to test MongoDB connection
app.get("/api/test-mongo", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: "MongoDB connection successful" });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    res
      .status(500)
      .json({ message: "MongoDB connection failed", error: error.message });
  }
});

// API route to get all Islands
app.get("/api/islands", async (req, res) => {
  try {
    const islands = await Island.find().sort({ dateTime: -1 }).lean();
    res.json(islands);
  } catch (error) {
    console.error("Error fetching islands:", error);
    res.status(500).json({ message: error.message });
  }
});

// API route to get beautified island data
app.get("/api/beautified-islands", async (req, res) => {
  try {
    const presignedUrls = await getUrls();
    console.log("Presigned URLs fetched:", presignedUrls.length);

    const mongoData = await queryAllIslands();
    console.log("MongoDB data fetched:", mongoData.length);

    const beautifiedData = await beautify(mongoData, presignedUrls);
    console.log("Data beautified:", beautifiedData.length);

    res.json(beautifiedData);
  } catch (error) {
    console.error("Error in /api/beautified-islands:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// Check if this module is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Start server if this is the main module
if (isMainModule) {
  connectDB()
    .then(() => {
      console.log("Successfully connected to MongoDB");
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Could not connect to MongoDB:", err);
      process.exit(1);
    });
}

export { connectDB, Island };
