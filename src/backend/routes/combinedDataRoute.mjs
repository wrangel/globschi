// src/backend/routes/combinedDataRoute.mjs

import express from "express";
import { getCombinedData } from "../dataHandler.mjs";
import { getCachedData, setCachedData, invalidateCache } from "../cache.mjs";
import logger from "../utils/logger.mjs";

const router = express.Router();

/**
 * GET /combined-data
 * Fetches combined data and returns it as JSON.
 */
router.get("/combined-data", async (req, res) => {
  const cacheKey = "combined-data"; // Define a cache key

  // Check if the data is cached
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    logger.info("[CACHE HIT] Returning cached combined-data");
    return res.status(200).json(cachedData); // Return cached data
  }

  logger.info("[CACHE MISS] Fetching fresh combined-data");

  try {
    const combinedData = await getCombinedData();
    setCachedData(cacheKey, combinedData); // Cache the fetched data
    res.status(200).json(combinedData);
  } catch (error) {
    logger.error("Error fetching combined data", { error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Example route to modify data (this is just an example; replace with actual routes)
router.post("/update-data", async (req, res) => {
  try {
    // Assume update logic here...

    // Invalidate cache after updating data
    invalidateCache("combined-data");

    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    logger.error("Error updating data", { error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
