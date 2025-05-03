// src/backend/routes/combinedDataRoute.mjs

import express from "express";
import { getCombinedData } from "../dataHandler.mjs";
import { getCachedData, setCachedData, invalidateCache } from "../cache.mjs";

const router = express.Router();

// Validation function to check if an item has all required properties populated
function isValidItem(item) {
  return (
    item &&
    typeof item.id === "string" &&
    item.id.trim() !== "" &&
    typeof item.latitude === "number" &&
    !isNaN(item.latitude) &&
    typeof item.longitude === "number" &&
    !isNaN(item.longitude) &&
    typeof item.viewer === "string" &&
    item.viewer.trim() !== "" &&
    typeof item.drone === "string" &&
    item.drone.trim() !== ""
    // Add other required properties here if needed
  );
}

/**
 * GET /combined-data
 * Fetches combined data and returns it as JSON.
 * Validates items and exits process if invalid data is found.
 */
router.get("/combined-data", async (req, res) => {
  const cacheKey = "combined-data";

  // Check if the data is cached
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    const combinedData = await getCombinedData();

    // Validate items
    const invalidItems = combinedData.filter((item) => !isValidItem(item));
    if (invalidItems.length > 0) {
      console.error("Found invalid items:", invalidItems);
      // Exit process with failure code 1 after logging
      process.exit(1);
    }

    setCachedData(cacheKey, combinedData);
    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching combined data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /update-data
 * Example route to update data and invalidate cache.
 */
router.post("/update-data", async (req, res) => {
  try {
    // Assume update logic here...

    // Invalidate cache after updating data
    invalidateCache("combined-data");

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
