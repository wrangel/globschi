// src/helpers/logger.mjs

import { createLogger, format, transports } from "winston";

// Create a logger instance
const logger = createLogger({
  level: "info", // Set the default logging level
  format: format.combine(
    format.colorize(), // Add color to log messages
    format.timestamp(), // Add timestamp to logs
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`; // Custom log format
    })
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: "combined.log" }), // Log to file
    new transports.File({ filename: "error.log", level: "error" }), // Log error messages to a separate file
  ],
});

// Export the logger for use in other modules
export default logger;
