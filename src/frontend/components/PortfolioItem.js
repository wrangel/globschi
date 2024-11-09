// src/components/PortfolioItem.js

import React, { useState, useCallback, memo } from "react";

// Memoized MetadataPopup component
const MetadataPopup = memo(({ item }) => {
  if (!item) return null;

  return (
    <div className="metadata-popup">
      <ul>
        <li>Date: {item.dateTime}</li>
        <li>
          Location: {item.location}, {item.region}, {item.country}
        </li>
        <li>
          Coordinates: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </li>
        <li>Altitude: {item.altitude}</li>
        <li>Postal Code: {item.postalCode}</li>
        {item.road && <li>Road: {item.road}</li>}
        <li>Views: {item.noViews}</li>
      </ul>
    </div>
  );
});

function PortfolioItem({ item, onItemClick }) {
  const [showMetadata, setShowMetadata] = useState(false);

  const handleClick = useCallback(() => {
    onItemClick(item); // Trigger the click action with the entire item
  }, [item, onItemClick]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onItemClick(item); // Trigger click action for keyboard users
      }
    },
    [item, onItemClick]
  );

  const handleMouseEnter = useCallback(() => {
    setShowMetadata(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowMetadata(false);
  }, []);

  if (!item || !item.thumbnailUrl) {
    console.warn("PortfolioItem: Invalid item data");
    return null;
  }

  return (
    <div
      className="portfolio-item"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0} // Make it focusable
      aria-label={`View ${item.name}`}
    >
      {/* Lazy load the image */}
      <img
        src={item.thumbnailUrl}
        alt={item.name || "Portfolio item"}
        loading="lazy" // Lazy loading attribute
      />
      {showMetadata && <MetadataPopup item={item} />}
    </div>
  );
}

export default memo(PortfolioItem);
