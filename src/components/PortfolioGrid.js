// src/components/PortfolioGrid.js
import React, { useState } from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";
import ImagePopup from "./ImagePopup";

function PortfolioGrid({ items }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleClosePopup = () => {
    setSelectedItem(null);
  };

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
      <ImagePopup item={selectedItem} onClose={handleClosePopup} />
    </>
  );
}

export default PortfolioGrid;
