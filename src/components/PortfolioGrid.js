import React, { useState, useCallback, useMemo } from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";
import ImagePopup from "./ImagePopup";

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

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

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {masonryItems}
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

export default React.memo(PortfolioGrid);
