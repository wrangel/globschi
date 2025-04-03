// src/components/PortfolioItem.js

import React, { memo, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "../styles/PortfolioItem.module.css";

const PortfolioItem = memo(({ item, onItemClick }) => {
  const handleClick = useCallback(() => {
    onItemClick(item);
  }, [item, onItemClick]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); // Prevent default action for space and enter keys
        onItemClick(item); // Trigger item click
      }
    },
    [item, onItemClick]
  );

  if (!item || !item.thumbnailUrl) {
    console.warn("PortfolioItem: Invalid item data");
    return null; // Gracefully handle invalid item data
  }

  console.log("PortfolioItem: item =", item);
  console.log("PortfolioItem: thumbnailUrl =", item.thumbnailUrl);

  return (
    <div
      className={styles.portfolioItem}
      onClick={handleClick} // Handle click event
      onKeyDown={handleKeyDown} // Handle keyboard navigation
      role="button" // Indicate that this div is a button
      tabIndex={0} // Make the div focusable
      aria-label={`View ${item.id}`} // Provide an accessible label
    >
      <img
        src={item.thumbnailUrl}
        alt={item.id || "Portfolio item"} // Fallback alt text
        loading="lazy" // Lazy load the image
      />
    </div>
  );
});

// Prop Types for validation
PortfolioItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string.isRequired,
  }).isRequired,
  onItemClick: PropTypes.func.isRequired,
};

export default PortfolioItem;
