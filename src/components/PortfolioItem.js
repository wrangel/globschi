// src/components/PortfolioItem.js
import React from "react";

function PortfolioItem({ item }) {
  return (
    <div className="portfolio-item">
      <img src={item.thumbnailUrl} alt={item.name} />
      <h3>{item.name}</h3>
    </div>
  );
}

export default PortfolioItem;
