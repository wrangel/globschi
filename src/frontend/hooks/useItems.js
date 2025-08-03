import { useState, useEffect, useCallback } from "react";

let cachedItems = null;

export const useItems = () => {
  const [items, setItems] = useState(cachedItems || []);
  const [isLoading, setIsLoading] = useState(!cachedItems);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (cachedItems) {
      setItems(cachedItems);
      return;
    }
    try {
      setIsLoading(true);
      setError(null); // Reset error state before fetching

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8081"; // Fallback URL
      const url = `${apiUrl}${apiUrl.endsWith("/") ? "" : "/"}combined-data`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
      cachedItems = data;
    } catch (e) {
      console.error("Error fetching data:", e);
      setError(
        e.name === "AbortError"
          ? "Request timed out. Please try again."
          : "Failed to load items. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearCache = useCallback(() => {
    cachedItems = null;
    setItems([]);
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { items, isLoading, error, refetch: fetchData, clearCache };
};
