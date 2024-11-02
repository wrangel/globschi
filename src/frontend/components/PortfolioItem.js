// PortfolioItem.js

import React, { useState, useCallback, memo } from "react";

const MetadataPopup = ({ item }) => {
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
};

function PortfolioItem({ item, onItemClick }) {
  const [showMetadata, setShowMetadata] = useState(false);

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

  const handleMouseEnter = useCallback(() => {
    setShowMetadata(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowMetadata(false);
  }, []);

  const handleFocus = useCallback(() => {
    setShowMetadata(true);
  }, []);

  const handleBlur = useCallback(() => {
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
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="button"
      tabIndex={0}
      aria-label={`View ${item.name}`}
    >
      <img
        src={item.thumbnailUrl}
        alt={item.name || "Portfolio item"}
        loading="lazy"
      />
      {showMetadata && <MetadataPopup item={item} />}
    </div>
  );
}

export default memo(PortfolioItem);
