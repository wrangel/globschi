// src/helpers/logger.mjs

import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Create a logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info", // Allow dynamic log level based on environment variable
  format: format.combine(
    format.timestamp(), // Add timestamp to logs
    format.json() // Use JSON format for structured logging
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(), // Add color to log messages in console
        format.simple() // Simple format for console output
      ),
    }),
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log", // Log file path with date pattern
      datePattern: "YYYY-MM-DD",
      zippedArchive: true, // Compress old log files
      maxSize: "20m", // Max size of each log file
      maxFiles: "14d", // Keep logs for 14 days
      level: "info", // Log level for this transport
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log", // Separate error log file
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "error", // Only log error messages to this file
    }),
  ],
});

// Error handling for logger itself (optional)
logger.on("error", (err) => {
  console.error("Logging error:", err);
});

// Export the logger for use in other modules
export default logger;
