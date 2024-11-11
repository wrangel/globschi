// src/components/PortfolioGrid.js
import React, { useMemo } from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";
import ViewerPopup from "./ViewerPopup";
import styles from "../styles/PortfolioGrid.module.css";
import { useSelectedItem } from "../hooks/useSelectedItem";

function PortfolioGrid({ items }) {
  const { selectedItemId, isModalOpen, handleItemClick, handleClosePopup } =
    useSelectedItem();

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

  if (!items || items.length === 0) {
    return <div>No items available.</div>;
  }

  return (
    <>
      <div>
        <Masonry
          breakpointCols={{
            default: 4,
            // Define breakpoints as needed
          }}
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
      />
    </>
  );
}

export default React.memo(PortfolioGrid);
