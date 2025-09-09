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

  // Log items state for debugging React DevTools (optional)
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
      console.debug(
        "[useItems] Using cached items, count:",
        cachedItems.length
      );
      setItems((prevItems) => {
        if (isSameArray(prevItems, cachedItems)) {
          console.debug(
            "[useItems] Cached items same as prev, skipping update"
          );
          return prevItems; // Avoid update if same array
        }
        console.debug(
          "[useItems] Cached items differ from prev, updating state"
        );
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

      console.debug("[useItems] Fetching data from API:", url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.debug("[useItems] Fetched items from API:", data.length);
      console.debug("[useItems] Sample item flags:", {
        isFirst: data[0]?.isFirst,
        isLast: data[0]?.isLast,
      });

      setItems((prevItems) => {
        if (isSameArray(prevItems, data)) {
          console.debug(
            "[useItems] Fetched data same as prev, skipping update"
          );
          return prevItems; // Avoid update if identical contents
        }
        console.debug("[useItems] Updating items state with new data");
        return [...data];
      });
      cachedItems = [...data];
    } catch (e) {
      console.error("[useItems] Error fetching items:", e);
      setError(
        e.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Failed to load items. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Log items changes for debugging
  useEffect(() => {
    console.debug("[useItems] items state updated, length:", items.length);
  }, [items]);

  // Fetch data on initial hook mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clears cached data and refreshes from network
  const clearCache = useCallback(() => {
    console.debug("[useItems] Clearing cache!");
    cachedItems = null;
    setItems([]);
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { items, isLoading, error, refetch: fetchData, clearCache };
};
