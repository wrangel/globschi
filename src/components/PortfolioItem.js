// src/components/PortfolioItem.js
import React, { useCallback, memo } from "react";

function PortfolioItem({ item, onItemClick }) {
  const handleClick = useCallback(() => {
    onItemClick(item);
  }, [item, onItemClick]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onItemClick(item);
      }
    },
    [item, onItemClick]
  );

  if (!item || !item.thumbnailUrl) {
    console.warn("PortfolioItem: Invalid item data");
    return null;
  }

  return (
    <div
      className="portfolio-item"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${item.name}`}
    >
      <img
        src={item.thumbnailUrl}
        alt={item.name || "Portfolio item"}
        loading="lazy"
      />
    </div>
  );
}

export default memo(PortfolioItem);
