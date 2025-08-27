// src/backend/cache.mjs

/**
 * @module cache
 *
 * Simple in-memory caching layer using NodeCache with TTL.
 * Provides functions to get, set, invalidate cache entries,
 * and print cache statistics for debugging.
 */

import NodeCache from "node-cache";
import logger from "./utils/logger.mjs";

const cache = new NodeCache({ stdTTL: 60 }); // Cache TTL of 60 seconds

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
 * Deletes a cache entry by key.
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
