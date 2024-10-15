// src/components/PortfolioItem.js
import React, { useState } from "react";
import MediaModal from "./MediaModal";

function PortfolioItem({ item }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="portfolio-item" onClick={() => setIsModalOpen(true)}>
      <img src={item.thumbnailUrl} alt={item.title} />
      <h3>{item.title}</h3>
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
      />
    </div>
  );
}

export default PortfolioItem;
