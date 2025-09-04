// src/frontend/views/GridPage.js

import React, { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import PortfolioGrid from "../components/PortfolioGrid";
import ViewerPopup from "../components/ViewerPopup";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import LoadingOverlay from "../components/LoadingOverlay";
import styles from "../styles/Grid.module.css";
import { DOMAIN } from "../constants";

function GridPage() {
  const { items, isLoading, error } = useItems();

  const {
    selectedItem,
    isModalOpen,
    handleItemClick,
    handleClosePopup,
    handleNextItem,
    handlePreviousItem,
  } = useItemViewer(items);

  // Memoize handlers passed down to ViewerPopup and PortfolioGrid for stable references
  const onItemClick = useCallback(handleItemClick, [handleItemClick]);
  const onClose = useCallback(handleClosePopup, [handleClosePopup]);
  const onNext = useCallback(handleNextItem, [handleNextItem]);
  const onPrevious = useCallback(handlePreviousItem, [handlePreviousItem]);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <div className={styles.homePage}>Error: {error}</div>;
  }

  return (
    <>
      <Helmet>
        <link rel="canonical" href={`${DOMAIN}grid`} />
        <title>Abstract Altitudes - Drone Imagery Gallery</title>
        <meta
          name="description"
          content="Explore our gallery of stunning drone-captured aerial images. View our portfolio of breathtaking landscapes and unique perspectives from above."
        />
      </Helmet>
      <div className={styles.homePage}>
        {items.length > 0 ? (
          <PortfolioGrid items={items} onItemClick={onItemClick} />
        ) : (
          <p>No items to display.</p>
        )}
        {isModalOpen && (
          <ViewerPopup
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={onClose}
            onNext={onNext}
            onPrevious={onPrevious}
          />
        )}
      </div>
    </>
  );
}

export default React.memo(GridPage);
