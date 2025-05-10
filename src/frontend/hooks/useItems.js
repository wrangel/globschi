// src/frontend/hooks/useItems.js

import { useState, useEffect, useCallback } from "react";

let cachedItems = null;

function isValidItem(item) {
  return (
    item &&
    typeof item.latitude === "number" &&
    !isNaN(item.latitude) &&
    typeof item.longitude === "number" &&
    !isNaN(item.longitude)
  );
}

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
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8081";
      const url = `${apiUrl}${apiUrl.endsWith("/") ? "" : "/"}combined-data`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Defensive validation and filtering
      if (!Array.isArray(data)) {
        console.error("Fetched data is not an array:", data);
        setItems([]);
        cachedItems = [];
        return;
      }

      const validItems = data.filter(isValidItem);

      if (validItems.length !== data.length) {
        const invalidItems = data.filter((item) => !isValidItem(item));
        console.warn(
          `Filtered out ${
            data.length - validItems.length
          } invalid items from API response:`,
          invalidItems
        );
      }

      setItems(validItems);
      cachedItems = validItems;
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
