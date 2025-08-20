// src/backend/cache.mjs

import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 }); // Cache TTL of 60 seconds

export const getCachedData = (key) => {
  try {
    const data = cache.get(key);
    if (data) {
      console.log(`[CACHE METRICS] Cache hit for key=${key}`);
    } else {
      console.log(`[CACHE METRICS] Cache miss for key=${key}`);
    }
    return data;
  } catch (error) {
    console.error(`[CACHE ERROR] getCachedData failed for key=${key}:`, error);
    return null;
  }
};

export const setCachedData = (key, value) => {
  try {
    cache.set(key, value);
    console.log(`[CACHE METRICS] Cache set for key=${key}`);
  } catch (error) {
    console.error(`[CACHE ERROR] setCachedData failed for key=${key}:`, error);
  }
};

export const invalidateCache = (key) => {
  try {
    cache.del(key);
    console.log(`[CACHE METRICS] Cache invalidated for key=${key}`);
  } catch (error) {
    console.error(
      `[CACHE ERROR] invalidateCache failed for key=${key}:`,
      error
    );
  }
};

// Optional: function to print cache stats anytime for debugging
export const printCacheStats = () => {
  const stats = cache.getStats();
  console.log("[CACHE STATS]", stats);
};
