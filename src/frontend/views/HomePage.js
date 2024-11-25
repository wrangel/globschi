// src/frontend/views/HomePage.js

import React from "react";
import PortfolioGrid from "../components/PortfolioGrid";
import ViewerPopup from "../components/ViewerPopup";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import { useNavigate } from "react-router-dom"; // Ensure this is imported
import styles from "../styles/Home.module.css";

function HomePage() {
  const { items, isLoading, error } = useItems();
  const {
    selectedItem,
    isModalOpen,
    handleItemClick,
    handleClosePopup,
    handleNextItem,
    handlePreviousItem,
  } = useItemViewer(items);
  const navigate = useNavigate();

  // Removed the handleNavigate function since we don't need it anymore

  if (isLoading) {
    return <div className={styles.homePage}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.homePage}>Error: {error}</div>;
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.headerWrapper}>
        <h1>Globschi Kollege von Dronef</h1>
        <h2>Der arme Dronef versunken im See</h2>
      </div>
      {items.length > 0 ? (
        <PortfolioGrid items={items} onItemClick={handleItemClick} />
      ) : (
        <p>No items to display.</p>
      )}
      {/* Removed the button */}
      {isModalOpen && (
        <ViewerPopup
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleClosePopup}
          onNext={handleNextItem}
          onPrevious={handlePreviousItem}
        />
      )}
    </div>
  );
}

export default React.memo(HomePage);
