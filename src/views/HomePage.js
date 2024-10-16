// src/views/HomePage.js
import React, { useState, useEffect } from "react";
import PortfolioGrid from "../components/PortfolioGrid";

function HomePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/combined-data")
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="home-page">
      <h1>Dronef Kollege von Globschi. Der arme Dronef versunken im See</h1>
      <PortfolioGrid items={items} />
    </div>
  );
}

export default HomePage;
