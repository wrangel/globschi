import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.DB_PORT || 8091;

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

// Check if this module is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Start server if this is the main module
if (isMainModule) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => console.error("Could not connect to MongoDB:", err));
}

export { connectDB, Island };
