// src/components/PortfolioItem.jsx

import { memo, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "../styles/PortfolioItem.module.css";

/**
 * PortfolioItem component renders a single clickable portfolio item with accessibility support.
 *
 * It handles click and keyboard activation (Enter or Space) to trigger onItemClick callback.
 * Displays the thumbnail image with lazy loading.
 * Uses memo to prevent unnecessary re-renders.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.item - Portfolio item data.
 * @param {string} props.item.id - Unique item identifier.
 * @param {string} props.item.thumbnailUrl - Thumbnail image URL.
 * @param {Function} props.onItemClick - Click handler function receiving the item.
 *
 * @returns {JSX.Element|null} Rendered portfolio item or null on invalid data.
 */
const PortfolioItem = memo(({ item, onItemClick }) => {
  const handleClick = useCallback(() => {
    onItemClick(item);
  }, [item, onItemClick]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); // Prevent default space and enter key scrolling
        onItemClick(item); // Trigger click via keyboard
      }
    },
    [item, onItemClick]
  );

  if (!item || !item.thumbnailUrl) {
    console.warn("PortfolioItem: Invalid item data");
    return null; // Avoid rendering if data is invalid
  }

  return (
    <div
      className={styles.portfolioItem}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button" // Accessibility role for keyboard users
      tabIndex={0} // Make div focusable and reachable by keyboard
      aria-label={`View ${item.id}`} // Descriptive label for assistive tech
    >
      <img
        src={item.thumbnailUrl}
        alt={item.id || "Portfolio item"} // Provide meaningful alt for images
        loading="lazy" // Lazy load images to improve performance
      />
    </div>
  );
});

PortfolioItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string.isRequired,
  }).isRequired,
  onItemClick: PropTypes.func.isRequired,
};

export default PortfolioItem;
