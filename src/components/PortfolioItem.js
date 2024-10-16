// src/components/PortfolioItem.js
import React from "react";

function PortfolioItem({ item, onItemClick }) {
  return (
    <div className="portfolio-item" onClick={() => onItemClick(item)}>
      <img src={item.thumbnailUrl} alt={item.name} />
    </div>
  );
}

export default PortfolioItem;
