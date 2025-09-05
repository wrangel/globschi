// src/frontend/components/PortfolioGrid.jsx

import PropTypes from "prop-types";
import Masonry from "react-masonry-css";
import LoadingErrorHandler from "./LoadingErrorHandler";
import PortfolioItem from "./PortfolioItem";
import { useLoadingError } from "../hooks/useLoadingError";
import { GRID_BREAKPOINTS } from "../constants";
import styles from "../styles/PortfolioGrid.module.css";

/**
 * PortfolioGrid component
 *
 * Displays portfolio items in a responsive masonry grid layout.
 * Handles loading and error states via a custom hook.
 *
 * Props:
 * - items: Array of portfolio items to display.
 * - onItemClick: Callback invoked when an item is clicked.
 */
function PortfolioGrid({ items, onItemClick }) {
  // Load and error state handled by custom hook, starts not loading
  const { isLoading, error } = useLoadingError(false);

  return (
    <LoadingErrorHandler isLoading={isLoading} error={error}>
      <Masonry
        breakpointCols={GRID_BREAKPOINTS} // Responsive column counts
        className={styles.masonryGrid} // Wrapper grid container class
        columnClassName={styles.masonryGridColumn} // Each column wrapper class
      >
        {items.map((item) => (
          <PortfolioItem key={item.id} item={item} onItemClick={onItemClick} />
        ))}
      </Masonry>
    </LoadingErrorHandler>
  );
}

PortfolioGrid.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onItemClick: PropTypes.func.isRequired,
};

export default PortfolioGrid;
