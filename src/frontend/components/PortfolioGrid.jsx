// src/frontend/components/PortfolioGrid.jsx

import Masonry from "react-masonry-css";
import LoadingErrorHandler from "./LoadingErrorHandler";
import PortfolioItem from "./PortfolioItem";
import { useLoadingError } from "../hooks/useLoadingError";
import { GRID_BREAKPOINTS } from "../constants";
import styles from "../styles/PortfolioGrid.module.css";

/**
 * PortfolioGrid component renders a masonry grid layout of portfolio items.
 *
 * It handles loading and error states using the useLoadingError hook,
 * and displays the portfolio items in a responsive masonry layout.
 *
 * @param {Object} props - Component props.
 * @param {Array} props.items - Array of portfolio items to display.
 * @param {Function} props.onItemClick - Callback function when an item is clicked.
 *
 * @returns {JSX.Element} The masonry grid wrapped in loading/error handler.
 */
const PortfolioGrid = ({ items, onItemClick }) => {
  const { isLoading, error } = useLoadingError(false);

  return (
    <LoadingErrorHandler isLoading={isLoading} error={error}>
      <div>
        <Masonry
          breakpointCols={GRID_BREAKPOINTS} // Responsive column counts
          className={styles.masonryGrid} // CSS class for the grid container
          columnClassName={styles.masonryGridColumn} // CSS class for each column
        >
          {items.map((item) => (
            <PortfolioItem
              key={item.id}
              item={item}
              onItemClick={onItemClick}
              useLazyImage={true} // new prop to toggle LazyImage use
            />
          ))}
        </Masonry>
      </div>
    </LoadingErrorHandler>
  );
};

export default PortfolioGrid;
