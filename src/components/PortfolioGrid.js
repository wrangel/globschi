// src/components/PortfolioGrid.js
import React, { useState } from "react";
import Masonry from "react-masonry-css";
import PortfolioItem from "./PortfolioItem";
import MediaModal from "./MediaModal";

function PortfolioGrid({ items }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (item) => {
    setSelectedItem(item);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const goToNext = () => {
    const currentIndex = items.findIndex((item) => item.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % items.length;
    setSelectedItem(items[nextIndex]);
  };

  const goToPrevious = () => {
    const currentIndex = items.findIndex((item) => item.id === selectedItem.id);
    const previousIndex = (currentIndex - 1 + items.length) % items.length;
    setSelectedItem(items[previousIndex]);
  };

  return (
    <>
      <Masonry
        breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {items.map((item) => (
          <PortfolioItem
            key={item.id}
            item={item}
            onClick={() => openModal(item)}
          />
        ))}
      </Masonry>
      <MediaModal
        isOpen={modalIsOpen}
        onClose={closeModal}
        item={selectedItem}
        onNext={goToNext}
        onPrev={goToPrevious}
      />
    </>
  );
}

export default PortfolioGrid;
