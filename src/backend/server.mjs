// src/backend/server.mjs

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import logger from "../utils/logger.mjs";
import combinedDataRoute from "./routes/combinedDataRoute.mjs";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

// Check for critical environment variables
const requiredEnvVars = [
  "MONGODB_DB_USER",
  "MONGODB_DB_PASSWORD",
  "MONGODB_SERVER",
  "MONGODB_DB",
];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    logger.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

logger.info("Starting server...");

const app = express();
const PORT = process.env.PORT || 8081;

// CORS configuration
const corsOrigin = ["http://localhost:3000", "drone.ellesmere.synology.me"];

// Enable CORS with dynamic origin
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// Middleware to log request origin
app.use((req, res, next) => {
  const origin = req.headers.origin;
  logger.info(`Request received from origin: ${origin}`);
  next();
});

// Rate limiting middleware for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting middleware to all /api routes BEFORE defining any routes
app.use("/api", apiLimiter);

// Define your /api routes (all rate-limited)
app.get("/api/test-mongo", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: "MongoDB connection successful" });
  } catch (error) {
    logger.error("MongoDB connection test failed:", { error });
    res.status(500).json({ error: "MongoDB connection test failed" });
  }
});

app.use("/api", combinedDataRoute);

// Serve static files from the React app build folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../../build")));

// Rate limiting middleware for non-API (general) routes like catch-all
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Basic route (non-API)
app.get("/", (req, res) => {
  res.send("Server is running");
});

// ** Fixed catch-all route: wildcard must be named to avoid path-to-regexp error **
app.get("/*splat", generalLimiter, (req, res) => {
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

// Connect to MongoDB
mongoose.set("strictQuery", false);
const connectDB = () =>
  mongoose
    .connect(
      `mongodb+srv://${process.env.MONGODB_DB_USER}:${process.env.MONGODB_DB_PASSWORD}@${process.env.MONGODB_SERVER}/${process.env.MONGODB_DB}?retryWrites=true&w=majority`
    )
    .catch((err) => {
      logger.error("MongoDB connection error:", err);
      throw err;
    });

// Start the server if this is the main module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

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
