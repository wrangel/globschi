// src/App.js
import React, { useState, useEffect } from "react";
import PortfolioGrid from "./components/PortfolioGrid";

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("/api/combined-data")
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="App">
      <h1>My Portfolio</h1>
      <PortfolioGrid items={items} />
    </div>
  );
}

export default App;
