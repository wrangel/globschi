// src/components/PortfolioItem.jsx

import { memo, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "../styles/PortfolioItem.module.css";

/**
 * PortfolioItem renders a single clickable portfolio thumbnail with keyboard accessibility.
 *
 * Handles click and keyboard activation (Enter or Space) to trigger onItemClick callback.
 * Uses memo to prevent unnecessary re-renders.
 *
 * @param {Object} props
 * @param {Object} props.item - Portfolio item data with required id and thumbnailUrl.
 * @param {Function} props.onItemClick - Handler called with the item on click or key action.
 * @returns {JSX.Element|null} Rendered item or null on invalid input.
 */
const PortfolioItem = memo(({ item, onItemClick }) => {
  // Memoized click handler to prevent re-creation on rerenders
  const handleClick = useCallback(() => {
    onItemClick(item);
  }, [item, onItemClick]);

  // Handle keyboard Enter or Space key for accessibility
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); // Prevent scroll on Space
        onItemClick(item);
      }
    },
    [item, onItemClick]
  );

  // Defensive: do not render if item or thumbnail missing
  if (!item || !item.thumbnailUrl) {
    console.warn("PortfolioItem: Missing item data or thumbnailUrl");
    return null;
  }

  return (
    <div
      className={styles.portfolioItem}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button" // accessibility role for keyboard users
      tabIndex={0} // make div keyboard focusable
      aria-label={`View portfolio item ${item.id}`}
    >
      <img
        src={item.thumbnailUrl}
        alt={item.id || "Portfolio item"}
        loading="lazy" // lazy load images for performance
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
