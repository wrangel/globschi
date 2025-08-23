// src/backend/cache.mjs

import NodeCache from "node-cache";
import logger from "../utils/logger.mjs";

const cache = new NodeCache({ stdTTL: 60 }); // Cache TTL of 60 seconds

export const getCachedData = (key) => {
  try {
    const data = cache.get(key);
    if (data) {
      logger.info(`[CACHE METRICS] Cache hit for key=${key}`);
    } else {
      logger.info(`[CACHE METRICS] Cache miss for key=${key}`);
    }
    return data;
  } catch (error) {
    logger.error(
      `[CACHE ERROR] getCachedData failed for key=${key}: ${error.message}`,
      { error }
    );
    return null;
  }
};

export const setCachedData = (key, value) => {
  try {
    cache.set(key, value);
    logger.info(`[CACHE METRICS] Cache set for key=${key}`);
  } catch (error) {
    logger.error(
      `[CACHE ERROR] setCachedData failed for key=${key}: ${error.message}`,
      { error }
    );
  }
};

export const invalidateCache = (key) => {
  try {
    cache.del(key);
    logger.info(`[CACHE METRICS] Cache invalidated for key=${key}`);
  } catch (error) {
    logger.error(
      `[CACHE ERROR] invalidateCache failed for key=${key}: ${error.message}`,
      { error }
    );
  }
};

// Optional: function to print cache stats anytime for debugging
export const printCacheStats = () => {
  try {
    const stats = cache.getStats();
    logger.info("[CACHE STATS]", stats);
  } catch (error) {
    logger.error(`[CACHE ERROR] printCacheStats failed: ${error.message}`, {
      error,
    });
  }
};
