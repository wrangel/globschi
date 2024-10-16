import React, { useState, useCallback } from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";
import ImagePopup from "./ImagePopup";

const PortfolioGrid = React.memo(({ items }) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedItem(null);
  }, []);

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
});

export default PortfolioGrid;
