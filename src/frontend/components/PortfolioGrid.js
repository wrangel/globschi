// src/components/PortfolioGrid.js
import React, { useMemo } from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";
import ViewerPopup from "./ViewerPopup";
import LoadingErrorHandler from "./LoadingErrorHandler";
import styles from "../styles/PortfolioGrid.module.css";
import { useItemViewer } from "../hooks/useItemViewer";
import { useLoadingError } from "../hooks/useLoadingError";
import { GRID_BREAKPOINTS } from "../constants";

function PortfolioGrid({ items }) {
  const { isLoading, error } = useLoadingError(false);
  const {
    selectedItem,
    isModalOpen,
    handleItemClick,
    handleClosePopup,
    handleNextItem,
    handlePreviousItem,
  } = useItemViewer(items);

  const masonryItems = useMemo(
    () =>
      items.map((item) => (
        <PortfolioItem
          key={item.id}
          item={item}
          onItemClick={handleItemClick}
        />
      )),
    [items, handleItemClick]
  );

  return (
    <LoadingErrorHandler isLoading={isLoading} error={error}>
      {items.length > 0 ? (
        <>
          <div>
            <Masonry
              breakpointCols={GRID_BREAKPOINTS}
              className={styles.masonryGrid}
              columnClassName={styles.masonryGridColumn}
            >
              {masonryItems}
            </Masonry>
          </div>

          <ViewerPopup
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={handleClosePopup}
            onNext={handleNextItem}
            onPrevious={handlePreviousItem}
          />
        </>
      ) : (
        <div>No items available.</div>
      )}
    </LoadingErrorHandler>
  );
}

export default React.memo(PortfolioGrid);
