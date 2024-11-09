// src/components/PortfolioGrid.js

import React, { useState, useCallback, useMemo, useRef } from "react";
import Masonry from "react-masonry-css";
import { usePinch } from "@use-gesture/react";
import PortfolioItem from "./PortfolioItem";
import ImagePopup from "./ImagePopup";
import PanView from "./PanView"; // Import PanView

function PortfolioGrid({ items }) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [columnCount, setColumnCount] = useState(4);
  const gridRef = useRef(null);

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

  usePinch(
    ({ offset: [d] }) => {
      const newColumnCount = Math.max(1, Math.min(8, Math.round(4 * (1 / d))));
      setColumnCount(newColumnCount);
    },
    {
      target: gridRef,
      eventOptions: { passive: false },
    }
  );

  const breakpointColumnsObj = useMemo(
    () => ({
      default: columnCount,
      1100: Math.min(columnCount, 3),
      700: Math.min(columnCount, 2),
      500: 1,
    }),
    [columnCount]
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
      <div ref={gridRef}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {masonryItems}
        </Masonry>
      </div>

      {selectedItem &&
        (selectedItem.viewer === "pano" ? (
          <PanView
            imageUrl={selectedItem.actualUrl}
            onClose={handleClosePopup}
          />
        ) : (
          <ImagePopup
            item={selectedItem}
            onClose={handleClosePopup}
            onNext={handleNextItem}
            onPrevious={handlePreviousItem}
          />
        ))}
    </>
  );
}

export default React.memo(PortfolioGrid);
