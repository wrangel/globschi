// src/frontend/components/PortfolioGrid.js
import React from "react";
import Masonry from "react-masonry-css";
import LoadingErrorHandler from "./LoadingErrorHandler";
import PortfolioItem from "./PortfolioItem";
import { useLoadingError } from "../hooks/useLoadingError";
import { GRID_BREAKPOINTS } from "../constants";
import styles from "../styles/PortfolioGrid.module.css";

const PortfolioGrid = ({ items, onItemClick }) => {
  const { isLoading, error } = useLoadingError(false);

  console.log("KKKEEEEEYY", process.env.REACT_APP_GOOGLE_MAPS_API_KEY); ////////////
  console.log("URLEEEEEE", process.env.REACT_APP_API_URL); ////////////

  return (
    <LoadingErrorHandler isLoading={isLoading} error={error}>
      <div>
        <Masonry
          breakpointCols={GRID_BREAKPOINTS}
          className={styles.masonryGrid}
          columnClassName={styles.masonryGridColumn}
        >
          {items.map((item) => (
            <PortfolioItem
              key={item.id}
              item={item}
              onItemClick={onItemClick}
            />
          ))}
        </Masonry>
      </div>
    </LoadingErrorHandler>
  );
};

export default PortfolioGrid;
