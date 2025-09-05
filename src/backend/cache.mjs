// src/backend/cache.mjs

import NodeCache from "node-cache";
import logger from "./utils/logger.mjs";
import fs from "fs";
import path from "path";

// Load configuration from environment variables or a config file
const cacheTTL = parseInt(process.env.CACHE_TTL || 60); // Default TTL of 60 seconds
const cacheCheckPeriod = parseInt(process.env.CACHE_CHECK_PERIOD || 60); // Default check period of 60 seconds
const cacheDir = process.env.CACHE_DIR || "./cache"; // Default cache directory

// Ensure the cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

const cache = new NodeCache({
  stdTTL: cacheTTL,
  checkperiod: cacheCheckPeriod,
  useClones: false,
});

/**
 * Retrieves cached data by key.
 * Logs cache hit or miss.
 * @param {string} key - Cache key
 * @returns {*} Cached value or undefined if not found
 */
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

/**
 * Stores data in cache with the given key.
 * @param {string} key - Cache key
 * @param {*} value - Data to cache
 */
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

/**
 * Deletes a cache entry by key, for manual deletion scenarios.
 * @param {string} key - Cache key
 */
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

/**
 * Logs cache statistics to help with debugging.
 */
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
