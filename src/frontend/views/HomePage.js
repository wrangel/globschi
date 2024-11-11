// src/views/HomePage.js
import React, { useState } from "react";
import PortfolioGrid from "../components/PortfolioGrid";
import styles from "../styles/Home.module.css";
import { useItems } from "../hooks/useItems";
import HamburgerMenu from "../components/HamburgerMenu"; // Import HamburgerMenu
import ViewerPopup from "../components/ViewerPopup"; // Import ViewerPopup

function HomePage() {
  const { items, isLoading, error } = useItems();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleClosePopup = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (isLoading) {
    return <div className={styles.homePage}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.homePage}>Error: {error}</div>;
  }

  return (
    <div className={styles.homePage}>
      <div className={styles.headerWrapper}>
        <h1>Dronef Kollege von Globschi. Der arme Dronef versunken im See</h1>
      </div>
      {items.length > 0 ? (
        <PortfolioGrid items={items} onItemClick={handleItemClick} />
      ) : (
        <p>No items to display.</p>
      )}
      {/* Render ViewerPopup if an item is selected */}
      {isModalOpen && (
        <ViewerPopup
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleClosePopup}
        />
      )}
      {/* Always render Hamburger Menu */}
      <HamburgerMenu />
    </div>
  );
}

export default React.memo(HomePage);
