// src/components/PortfolioGrid.js
import React, { useState, useCallback } from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";
import ImagePopup from "./ImagePopup";

function PortfolioGrid({ items }) {
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleItemClick = useCallback((clickedItem) => {
    setSelectedItemId(clickedItem.id);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  const handleNextItem = useCallback(() => {
    setSelectedItemId((prevId) => {
      const currentIndex = items.findIndex((item) => item.id === prevId);
      const nextIndex = (currentIndex + 1) % items.length;
      return items[nextIndex].id;
    });
  }, [items]);

  const handlePreviousItem = useCallback(() => {
    setSelectedItemId((prevId) => {
      const currentIndex = items.findIndex((item) => item.id === prevId);
      const previousIndex = (currentIndex - 1 + items.length) % items.length;
      return items[previousIndex].id;
    });
  }, [items]);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  const selectedItem = items.find((item) => item.id === selectedItemId) || null;

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {items.map((item) => (
          <PortfolioItem
            key={item.id}
            item={item}
            onItemClick={handleItemClick}
          />
        ))}
      </Masonry>
      <ImagePopup
        item={selectedItem}
        onClose={handleClosePopup}
        onNext={handleNextItem}
        onPrevious={handlePreviousItem}
      />
    </>
  );
}

export default PortfolioGrid;
