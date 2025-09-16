// src/frontend/views/Grid.js

import React, { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import PortfolioGrid from "../components/PortfolioGrid";
import PopupViewer from "../components/PopupViewer";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import LoadingOverlay from "../components/LoadingOverlay";
import MascotCorner from "../components/MascotCorner";
import ErrorBoundary from "../components/ErrorBoundary"; // import ErrorBoundary
import styles from "../styles/Grid.module.css";
import { DOMAIN } from "../constants";

function Grid() {
  const { items, isLoading, error } = useItems();
  const {
    selectedItem,
    isModalOpen,
    handleItemClick,
    handleClosePopup,
    handleNextItem,
    handlePreviousItem,
  } = useItemViewer(items);

  const onItemClick = useCallback(handleItemClick, [handleItemClick]);
  const onClose = useCallback(handleClosePopup, [handleClosePopup]);
  const onNext = useCallback(handleNextItem, [handleNextItem]);
  const onPrevious = useCallback(handlePreviousItem, [handlePreviousItem]);

  if (isLoading) {
    return (
      <LoadingOverlay
        ariaLive="polite"
        ariaLabel="Loading gallery images, please wait"
      />
    );
  }

  if (error) {
    return (
      <div
        className={styles.Home}
        role="alert"
        aria-live="assertive"
        tabIndex={-1}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <MascotCorner />
      <Helmet>
        <link rel="canonical" href={`${DOMAIN}grid`} />
        <title>Abstract Altitudes</title>
        <meta
          name="description"
          content="Explore our gallery of stunning drone-captured aerial images. View our portfolio of breathtaking landscapes and unique perspectives from above."
        />
      </Helmet>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content" className={styles.Home}>
        {items.length > 0 ? (
          <ErrorBoundary>
            <PortfolioGrid items={items} onItemClick={onItemClick} />
          </ErrorBoundary>
        ) : (
          <p>No items to display.</p>
        )}
        {isModalOpen && (
          <PopupViewer
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={onClose}
            onNext={onNext}
            onPrevious={onPrevious}
          />
        )}
      </main>
    </>
  );
}

export default React.memo(Grid);
