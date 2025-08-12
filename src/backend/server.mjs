// src/backend/server.mjs

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import logger from "./helpers/logger.mjs";
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
  const origin = req.headers.origin; // Get the origin from the request headers
  logger.info(`Request received from origin: ${origin}`); // Log the origin
  next(); // Proceed to the next middleware or route handler
});

// Rate limiting middleware for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per 15 minutes
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Apply rate limiting middleware to all /api routes BEFORE declaring those routes
app.use("/api", apiLimiter);

// Now define /api routes (these routes will use the rate limiter)
app.get("/api/test-mongo", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: "MongoDB connection successful" });
  } catch (error) {
    logger.error("MongoDB connection test failed:", { error });
    res.status(500).json({ error: "MongoDB connection test failed" });
  }
});

// Combined data routes (all prefixed with /api)
app.use("/api", combinedDataRoute);

// Serve static files from the React app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../../build")));

// Basic route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Catch-all handler for any request that doesn't match above routes
app.get("/*rest", (req, res) => {
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
