// src/backend/server.mjs

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { loadEnv } from "./loadEnv.mjs";
import combinedDataRoute from "./routes/combinedDataRoute.mjs";
import { Island } from "./models/islandModel.mjs";

loadEnv();

console.log("Starting server...");

const app = express();
const PORT = process.env.PORT || 8081;

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.set("strictQuery", false);
const connectDB = () =>
  mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.SERVER}/${process.env.DB}?retryWrites=true&w=majority`
  );

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
    console.error("MongoDB connection test failed:", error);
    res.status(500).json({ error: "MongoDB connection test failed" });
  }
});

// Use the combined data route
app.use("/api", combinedDataRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
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

export { connectDB };
