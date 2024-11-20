// src/backend/server.mjs
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import logger from "./helpers/logger.mjs";
import combinedDataRoute from "./routes/combinedDataRoute.mjs";
import { loadEnv } from "./loadEnv.mjs";
import path from "path";
import { fileURLToPath } from "url";

try {
  loadEnv();
} catch (error) {
  logger.error("Failed to load environment variables:", error);
  process.exit(1);
}

// Check for critical environment variables
const requiredEnvVars = ["DB_USER", "DB_PASSWORD", "SERVER", "DB"];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    logger.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

logger.info("Starting server...");

const app = express();
const PORT = process.env.PORT || 8081;

const corsOrigin = ["http://localhost:3000", "drone.ellesmere.synology.me"];

// Enable CORS with dynamic origin
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// Connect to MongoDB
mongoose.set("strictQuery", false);
const connectDB = () =>
  mongoose
    .connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.SERVER}/${process.env.DB}?retryWrites=true&w=majority`
    )
    .catch((err) => {
      logger.error("MongoDB connection error:", err);
      throw err;
    });

// Serve static files from the React app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../../build")));

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
    logger.error("MongoDB connection test failed:", { error });
    res.status(500).json({ error: "MongoDB connection test failed" });
  }
});

// Use the combined data route
app.use("/api", combinedDataRoute);

// Catch-all handler for any request that doesn't match above routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../build", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

// Check if this module is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Start server if this is the main module
if (isMainModule) {
  connectDB()
    .then(() => {
      logger.info("Successfully connected to MongoDB");
      app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      logger.error("Failed to start the server:", { error: err });
      process.exit(1);
    });
}

export { connectDB };
