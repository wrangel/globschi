// src/components/PortfolioItem.js
import React from "react";

function PortfolioItem({ item }) {
  return (
    <div className="portfolio-item">
      <img src={item.thumbnailUrl} alt={item.name} />
    </div>
  );
}

export default PortfolioItem;
