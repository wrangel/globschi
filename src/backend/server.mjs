// src/backend/server.mjs

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import logger from "./utils/logger.mjs";
import combinedDataRoute from "./routes/combinedDataRoute.mjs";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { connectDB, closeDB } from "./utils/mongodbConnection.mjs";

// List of environment variables required for MongoDB connection
const requiredEnvVars = [
  "MONGODB_DB_USER",
  "MONGODB_DB_PASSWORD",
  "MONGODB_SERVER",
  "MONGODB_DB",
];

// Verify required environment variables exist; exit if missing
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    logger.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

logger.info("Starting server...");

const app = express();
const PORT = process.env.PORT || 8081;

// CORS configuration: allow specific origins and preflight success status
const corsOrigin = [
  "http://localhost:3000",
  "https://drone.ellesmere.synology.me",
];

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    optionsSuccessStatus: 200, // Handle legacy browsers' preflight request response
  })
);

// Middleware to log the origin of each incoming request
app.use((req, res, next) => {
  const origin = req.headers.origin;
  logger.info(`Request received from origin: ${origin}`);
  next();
});

// Compression middleware
app.use(compression());

// Rate limiter middleware to limit excessive API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Apply rate limiting to all /api routes before defining them
app.use("/api", apiLimiter);

// Simple test route to verify MongoDB connection
app.get("/api/test-mongo", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: "MongoDB connection successful" });
  } catch (error) {
    logger.error("MongoDB connection test failed:", { error });
    res.status(500).json({ error: "MongoDB connection test failed" });
  }
});

// Mount combinedDataRoute under /api
app.use("/api", combinedDataRoute);

// Serve static files (React build) from relative path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../../build")));

// Rate limiter for general non-API routes (including catch-all)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Basic home route response
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Catch-all for all other routes - serves React app's index.html
app.get("/*splat", generalLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, "../../build", "index.html"));
});

// Centralized error handling middleware
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

// MongoDB connection configuration and handler function
mongoose.set("strictQuery", false);

// Start server only when this module is the main entry point
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      logger.error("Failed to start the server:", { error: err });
      process.exit(1);
    });
}

// Export closeDB for external use/testing
export { closeDB };
