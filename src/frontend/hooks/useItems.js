import { useState, useEffect, useCallback } from "react";

let cachedItems = null;

export const useItems = () => {
  const [items, setItems] = useState(cachedItems || []);
  const [isLoading, setIsLoading] = useState(!cachedItems);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (cachedItems) {
      return; // Use cached data if available
    }
    try {
      setIsLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/api/combined-data`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
      cachedItems = data; // Cache the fetched data
    } catch (e) {
      console.error("Error fetching data:", e);
      setError("Failed to load items. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, isLoading, error, refetch: fetchData };
};
