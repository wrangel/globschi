import React, { useState, useCallback, useEffect, useMemo } from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";
import ImagePopup from "./ImagePopup";
import { debounce } from "../utils/utils";

const PortfolioGrid = React.memo(({ items }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Adjust this number as needed

  const [breakpointColumns, setBreakpointColumns] = useState({
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  });

  const handleItemClick = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const updateBreakpoints = useCallback(() => {
    const width = window.innerWidth;
    setBreakpointColumns((prevState) => ({
      ...prevState,
      default: width >= 1100 ? 4 : width >= 700 ? 3 : width >= 500 ? 2 : 1,
    }));
  }, []);

  const debouncedUpdateBreakpoints = useMemo(
    () => debounce(updateBreakpoints, 250),
    [updateBreakpoints]
  );

  useEffect(() => {
    window.addEventListener("resize", debouncedUpdateBreakpoints);
    return () => {
      window.removeEventListener("resize", debouncedUpdateBreakpoints);
    };
  }, [debouncedUpdateBreakpoints]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const memoizedItems = useMemo(
    () =>
      currentItems.map((item) => (
        <PortfolioItem
          key={item.id}
          item={item}
          onItemClick={handleItemClick}
        />
      )),
    [currentItems, handleItemClick]
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {memoizedItems}
      </Masonry>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => paginate(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
      <ImagePopup item={selectedItem} onClose={handleClosePopup} />
    </>
  );
});

export default PortfolioGrid;
