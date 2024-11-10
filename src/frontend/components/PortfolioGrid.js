// src/components/PortfolioGrid.js

import React, { useState, useCallback, useMemo } from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";
import ImagePopup from "./ImagePopup";
import PanoramaViewer from "./PanoramaViewer";
import FullScreenModal from "./FullScreenModal";
import styles from "../styles/PortfolioGrid.module.css";

function PortfolioGrid({ items }) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = useCallback((clickedItem) => {
    setSelectedItemId(clickedItem.id);
    if (clickedItem.viewer === "pano") {
      setIsModalOpen(true); // Open modal for panoramas
    }
  }, []);

  const handleClosePopup = useCallback(() => {
    setIsModalOpen(false); // Close modal
    setSelectedItemId(null); // Clear selected item
  }, []);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) || null,
    [items, selectedItemId]
  );

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

  // Conditional rendering for empty state
  if (!items || items.length === 0) {
    return <div>No items available.</div>; // Graceful handling of no items
  }

  return (
    <>
      <div>
        <Masonry
          breakpointCols={{
            default: 4,
            // Define breakpoints as needed
          }}
          className={styles.masonryGrid} // Use styles from the module
          columnClassName={styles.masonryGridColumn} // Use styles from the module
        >
          {masonryItems}
        </Masonry>
      </div>

      {/* Full-Screen Modal for Panorama Viewer */}
      {isModalOpen && selectedItem && (
        <FullScreenModal isOpen={isModalOpen} onClose={handleClosePopup}>
          <PanoramaViewer
            imageUrl={selectedItem.actualUrl}
            onClose={handleClosePopup}
          />
        </FullScreenModal>
      )}

      {/* Render ImagePopup for images */}
      {selectedItem && selectedItem.viewer !== "pano" && (
        <ImagePopup item={selectedItem} onClose={handleClosePopup} />
      )}
    </>
  );
}

export default React.memo(PortfolioGrid);
