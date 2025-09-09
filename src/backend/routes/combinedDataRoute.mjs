// src/backend/routes/combinedDataRoute.mjs
import express from "express";
import { getCombinedData } from "../dataHandler.mjs";
import { getCachedData, setCachedData } from "../cache.mjs";
import logger from "../utils/logger.mjs";

const router = express.Router();

router.get("/combined-data", async (req, res) => {
  const cacheKey = "combined-data";

  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    logger.info("[CACHE HIT] Returning cached combined-data");
    return res.status(200).json(cachedData);
  }

  logger.info("[CACHE MISS] Fetching fresh combined-data");

  try {
    const combinedData = await getCombinedData();

    // Add isFirst and isLast flags
    combinedData.forEach((item, index) => {
      item.isFirst = index === 0;
      item.isLast = index === combinedData.length - 1;
    });

    setCachedData(cacheKey, combinedData);
    res.status(200).json(combinedData);
  } catch (error) {
    logger.error("Error fetching combined data", { error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
