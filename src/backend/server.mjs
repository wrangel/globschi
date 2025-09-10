// src/backend/server.mjs

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./utils/logger.mjs";
import combinedDataRoute from "./routes/combinedDataRoute.mjs";
import { connectDB, closeDB } from "./utils/mongodbConnection.mjs";

// ---------- env check (same style as original) ----------
const requiredEnvVars = [
  "MONGODB_DB_USER",
  "MONGODB_DB_PASSWORD",
  "MONGODB_SERVER",
  "MONGODB_DB",
];
requiredEnvVars.forEach((v) => {
  if (!process.env[v]) {
    logger.error(`Missing required environment variable: ${v}`);
    process.exit(1);
  }
});

logger.info("Starting server...");

const app = express();
const PORT = process.env.PORT || 8081;

// ---------- CORS (unchanged) ----------
const corsOrigin = ["http://localhost:3000", "drone.ellesmere.synology.me"];
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// ---------- NEW: security headers ----------
app.use(helmet({ contentSecurityPolicy: false })); // SPA friendly

// ---------- NEW: brotli + gzip + etag for SPA ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import expressStaticGzip from "express-static-gzip";
app.use(
  "/",
  expressStaticGzip(path.join(__dirname, "../../build"), {
    enableBrotli: true,
    orderPreference: ["br", "gz"],
    etag: true,
    maxAge: "1d",
  })
);

// ---------- compression (kept) ----------
app.use(compression({ level: 6, threshold: 1024 }));

// ---------- request logger (kept) ----------
app.use((req, res, next) => {
  const origin = req.headers.origin;
  logger.info(`Request received from origin: ${origin}`);
  next();
});

// ---------- NEW: health / readiness ----------
app.get("/healthz", (_, res) => res.status(200).send("ok"));
app.get("/ready", async (_, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.status(200).send("ready");
  } catch {
    res.status(503).send("not ready");
  }
});

// ---------- rate limit (skip probes) ----------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/healthz" || req.path === "/ready",
});
app.use("/api", apiLimiter);

// ---------- routes (unchanged) ----------
app.use("/api", combinedDataRoute);
app.get("/api/test-mongo", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: "MongoDB connection successful" });
  } catch (error) {
    logger.error("MongoDB connection test failed:", { error });
    res.status(500).json({ error: "MongoDB connection test failed" });
  }
});

// ---------- catch-all (unchanged) ----------
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.get("/", (_, res) => res.send("Server is running"));
app.get("/*splat", generalLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, "../../build", "index.html"));
});

// ---------- error handler (unchanged) ----------
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

// ---------- NEW: graceful shutdown ----------
mongoose.set("strictQuery", false);
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  connectDB()
    .then(() => {
      const server = app.listen(PORT, () =>
        logger.info(`Server is running on port ${PORT}`)
      );
      // graceful stop
      process.on("SIGTERM", async () => {
        logger.info("SIGTERM received – shutting down gracefully");
        await closeDB();
        server.close(() => process.exit(0));
      });
    })
    .catch((err) => {
      logger.error("Failed to start the server:", { error: err });
      process.exit(1);
    });
}

// keep original export
export { closeDB };
