// src/backend/routes/combinedDataRoute.mjs

import express from "express";
import { getCombinedData } from "../dataHandler.mjs";
import { getCachedData, setCachedData, invalidateCache } from "../cache.mjs";
import logger from "../utils/logger.mjs";

const router = express.Router();

/**
 * GET /combined-data
 * Retrieves combined data from cache or fetches fresh data if cache is empty.
 * Responds with JSON array of combined data.
 */
router.get("/combined-data", async (req, res) => {
  const cacheKey = "combined-data"; // Cache key for combined data

  // Attempt to get cached data
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    logger.info("[CACHE HIT] Returning cached combined-data");
    return res.status(200).json(cachedData);
  }

  logger.info("[CACHE MISS] Fetching fresh combined-data");

  try {
    // Fetch fresh combined data and cache it
    const combinedData = await getCombinedData();

    setCachedData(cacheKey, combinedData);
    res.status(200).json(combinedData);
  } catch (error) {
    logger.error("Error fetching combined data", { error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
