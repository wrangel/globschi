import React from "react";
import { Helmet } from "react-helmet-async";
import PortfolioGrid from "../components/PortfolioGrid";
import ViewerPopup from "../components/ViewerPopup";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import LoadingOverlay from "../components/LoadingOverlay";
import styles from "../styles/Grid.module.css";
import { domain } from "../constants";

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

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <div className={styles.homePage}>Error: {error}</div>;
  }

  return (
    <>
      <Helmet>
        <link rel="canonical" href={`${domain}grid`} />
        <title>Abstract Altitudes - Drone Imagery Gallery</title>
        <meta
          name="description"
          content="Explore our gallery of stunning drone-captured aerial images. View our portfolio of breathtaking landscapes and unique perspectives from above."
        />
      </Helmet>
      <div className={styles.homePage}>
        {items.length > 0 ? (
          <PortfolioGrid items={items} onItemClick={handleItemClick} />
        ) : (
          <p>No items to display.</p>
        )}
        {isModalOpen && (
          <ViewerPopup
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={handleClosePopup}
            onNext={handleNextItem}
            onPrevious={handlePreviousItem}
          />
        )}
      </div>
    </>
  );
}

export default React.memo(GridPage);
