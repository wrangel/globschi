// src/frontend/components/PortfolioGrid.js
import React from "react";
import Masonry from "react-masonry-css";
import LoadingErrorHandler from "./LoadingErrorHandler";
import styles from "../styles/PortfolioGrid.module.css";
import { useLoadingError } from "../hooks/useLoadingError";
import { GRID_BREAKPOINTS } from "../constants";
import WithItemRendering from "../hocs/WithItemRendering";

const PortfolioGrid = ({ children }) => {
  const { isLoading, error } = useLoadingError(false);

  return (
    <LoadingErrorHandler isLoading={isLoading} error={error}>
      <div>
        <Masonry
          breakpointCols={GRID_BREAKPOINTS}
          className={styles.masonryGrid}
          columnClassName={styles.masonryGridColumn}
        >
          {children} {/* Rendered items will be passed here */}
        </Masonry>
      </div>
    </LoadingErrorHandler>
  );
};

export default WithItemRendering(PortfolioGrid);
