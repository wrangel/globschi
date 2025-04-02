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

  // Check if the data is cached
  const cachedData = getCachedData(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData); // Return cached data
  }

  try {
    // Fetch combined data using the updated logic
    const combinedData = await getCombinedData();

    // Cache the fetched data
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
