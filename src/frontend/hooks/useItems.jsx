// src/frontend/hooks/useItems.jsx

import { useState, useEffect, useCallback, useDebugValue } from "react";

let cachedItems = null;

/**
 * Custom hook to fetch and cache portfolio or data items from an API endpoint.
 *
 * Implements caching to avoid redundant network requests,
 * with support for loading, error states, refetching, and cache clearing.
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
    if (cachedItems) {
      setItems((prevItems) => {
        if (isSameArray(prevItems, cachedItems)) {
          return prevItems; // Avoid update if same array
        }
        return [...cachedItems];
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8081/api/";
      const url = `${apiUrl}${apiUrl.endsWith("/") ? "" : "/"}combined-data`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setItems((prevItems) => {
        if (isSameArray(prevItems, data)) {
          return prevItems; // Avoid update if identical contents
        }
        return [...data];
      });
      cachedItems = [...data];
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
    setItems([]);
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { items, isLoading, error, refetch: fetchData, clearCache };
};
