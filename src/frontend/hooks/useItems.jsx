// src/frontend/hooks/useItems.jsx

import { useState, useEffect, useCallback, useDebugValue } from "react";
import { COMBINED_DATA_URL } from "../constants";

let cachedItems = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook to fetch and cache portfolio or data items from an API endpoint.
 *
 * Implements caching to avoid redundant network requests,
 * with support for loading, error states, refetching, and cache clearing.
 * Cache expires after a TTL to keep data fresh.
 *
 * @returns {Object} An object containing:
 *   - items: Array of fetched items,
 *   - isLoading: Boolean loading flag,
 *   - error: Error message string or null,
 *   - refetch: Function to manually refetch items,
 *   - clearCache: Function to clear cache and reload items.
 */
export const useItems = () => {
  const [items, setItems] = useState(cachedItems ? [...cachedItems] : []);
  const [isLoading, setIsLoading] = useState(!cachedItems);
  const [error, setError] = useState(null);

  // Debug value for React DevTools only
  useDebugValue(items, (items) => `Items count: ${items.length}`);

  // Shallow equality check helper to avoid unnecessary state updates
  const isSameArray = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  // Function to fetch data from API with timeout and abort controller
  const fetchData = useCallback(async () => {
    const now = Date.now();

    // Use cache if fresh
    if (cachedItems && now - cacheTimestamp < CACHE_TTL) {
      setItems((prevItems) =>
        isSameArray(prevItems, cachedItems) ? prevItems : [...cachedItems]
      );
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(COMBINED_DATA_URL, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setItems((prevItems) =>
        isSameArray(prevItems, data) ? prevItems : [...data]
      );
      cachedItems = [...data];
      cacheTimestamp = Date.now(); // Update cache timestamp
    } catch (e) {
      setError(
        e.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Failed to load items. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on initial hook mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clears cached data and refreshes from network
  const clearCache = useCallback(() => {
    cachedItems = null;
    cacheTimestamp = 0;
    setItems([]);
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { items, isLoading, error, refetch: fetchData, clearCache };
};
