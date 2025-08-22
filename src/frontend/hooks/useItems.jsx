// src/frontend/hooks/useItems.jsx

import { useState, useEffect, useCallback, useRef } from "react";

let cachedItems = null;

export const useItems = () => {
  const [items, setItems] = useState(cachedItems ? [...cachedItems] : []);
  const [isLoading, setIsLoading] = useState(!cachedItems);
  const [error, setError] = useState(null);
  // For testing, disable mountedRef guard if necessary
  //const mountedRef = useRef(true);

  useEffect(() => {
    if (items.length > 0) {
      console.log("Items state updated (useEffect):", items);
    }
  }, [items]);

  const fetchData = useCallback(async () => {
    if (cachedItems) {
      setItems([...cachedItems]);
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
      console.log("Fetched ", data);

      // Testing: remove mountedRef checks
      // if (!mountedRef.current) return;

      setItems([...data]);
      cachedItems = [...data];
    } catch (e) {
      // if (!mountedRef.current) return;
      console.error("Error fetching ", e);
      setError(
        e.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Failed to load items. Please try again later."
      );
    } finally {
      // if (!mountedRef.current) return;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // For testing, omit mountedRef cleanup
    // return () => { mountedRef.current = false }
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cachedItems = null;
    setItems([]);
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { items, isLoading, error, refetch: fetchData, clearCache };
};
