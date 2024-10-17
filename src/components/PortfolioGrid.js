// src/components/PortfolioGrid.js
import React, { useState, useCallback } from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";
import ImagePopup from "./ImagePopup";

function PortfolioGrid({ items }) {
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const handleItemClick = useCallback(
    (clickedItem) => {
      const index = items.findIndex((item) => item.id === clickedItem.id);
      setSelectedItemIndex(index);
    },
    [items]
  );

  const handleClosePopup = useCallback(() => {
    setSelectedItemIndex(null);
  }, []);

  const handleNextItem = useCallback(() => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex((prevIndex) => (prevIndex + 1) % items.length);
    }
  }, [items.length, selectedItemIndex]);

  const handlePreviousItem = useCallback(() => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex(
        (prevIndex) => (prevIndex - 1 + items.length) % items.length
      );
    }
  }, [items.length, selectedItemIndex]);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

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
        item={selectedItemIndex !== null ? items[selectedItemIndex] : null}
        onClose={handleClosePopup}
        onNext={handleNextItem}
        onPrevious={handlePreviousItem}
      />
    </>
  );
}

export default PortfolioGrid;
