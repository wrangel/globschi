// src/components/PortfolioGrid.js
import React from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";

function PortfolioGrid({ items }) {
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="masonry-grid"
      columnClassName="masonry-grid_column"
    >
      {items.map((item) => (
        <PortfolioItem key={item.id} item={item} />
      ))}
    </Masonry>
  );
}

export default PortfolioGrid;
