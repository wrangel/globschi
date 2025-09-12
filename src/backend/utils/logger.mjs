// src/backend/utils/logger.mjs

import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

/**
 * Creates a Winston logger instance with:
 * - Dynamic log level based on environment variable LOG_LEVEL (default "info")
 * - JSON formatted structured logs with timestamps
 * - Console transport with colored and simple output (for development)
 * - Daily rotating file transports:
 *   - One for general info logs (rotates daily, compressed, keeps 14 days)
 *   - One for error logs only (rotates daily, compressed, keeps 14 days)
 *
 * Best practices included:
 * - Use JSON logs with timestamps for structured logging
 * - Separate error and info logs into different files for analysis
 * - Use console colorization for readability during development
 * - Handle internal logger errors gracefully
 * - Enable log file compression and rotation to save disk space
 */
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp(), // Adds ISO timestamp to each log
    format.json() // Outputs logs in JSON for structured logging
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(), // Adds colors to console logs for better readability
        format.simple() // Simplified message format for console
      ),
    }),
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true, // Compress old logs
      maxSize: "20m", // Rotate on 20MB file size
      maxFiles: "14d", // Retain logs for 14 days
      level: "info", // Log info and above here
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "error", // Only error logs here
    }),
  ],
});

// Optional: Listen for errors inside the logger itself and log to console
logger.on("error", (err) => {
  console.error("Logging error:", err);
});

// Export configured logger instance for use in other modules
export default logger;
