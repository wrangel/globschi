// src/backend/routes/com.mjs

import express from "express";
import { getCombinedData } from "../dataHandler.mjs";
import { getCachedData, setCachedData, invalidateCache } from "../cache.mjs";

const router = express.Router();

/**
 * GET /combined-data
 * Fetches combined data and returns it as JSON.
 */
router.get("/combined-data", async (req, res) => {
  const cacheKey = "combined-data"; // Define a cache key

  try {
    console.log("Checking cache...");
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log("Cache hit! Returning cached data.");
      return res.status(200).json(cachedData); // Return cached data
    }

    console.log("Cache miss. Fetching combined data...");
    const combinedData = await getCombinedData();
    console.log("Combined data fetched successfully:", combinedData);

    console.log("Setting cache...");
    setCachedData(cacheKey, combinedData);

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching combined data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /update-data
 * Example route to modify data (replace with actual implementation).
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
