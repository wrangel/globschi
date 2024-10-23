// src/views/HomePage.js
import React, { useState, useEffect, useCallback } from "react";
import PortfolioGrid from "../components/PortfolioGrid";

function HomePage() {
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
      setItems(data);
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
    return <div className="home-page">Loading...</div>;
  }

  if (error) {
    return <div className="home-page">Error: {error}</div>;
  }

  return (
    <div className="home-page">
      <h1>Dronef Kollege von Globschi. Der arme Dronef versunken im See</h1>
      {items.length > 0 ? (
        <PortfolioGrid items={items} />
      ) : (
        <p>No items to display.</p>
      )}
    </div>
  );
}

export default React.memo(HomePage);
