// src/views/PanoPage.js

import React, { useState, useEffect, useCallback } from "react";

function PanoPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/combined-data");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Filter items to only include those with viewer 'pano'
      const filteredItems = data.filter((item) => item.viewer === "pano");
      setItems(filteredItems);

      // Console log all the properties of each item
      filteredItems.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, item);
      });
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

  if (isLoading) {
    return <div className="pano-page">Loading...</div>;
  }

  if (error) {
    return <div className="pano-page">Error: {error}</div>;
  }

  return (
    <div className="pano-page">
      <h1>Panorama URLs</h1>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <a href={item.actualUrl} target="_blank" rel="noopener noreferrer">
              {item.name || `Panorama ${index + 1}`}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default React.memo(PanoPage);
