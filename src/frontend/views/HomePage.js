// src/frontend/views/HomePage.js
import React, { useState, useCallback } from "react";
import PortfolioGrid from "../components/PortfolioGrid";
import styles from "../styles/Home.module.css";
import { useItems } from "../hooks/useItems";
import HamburgerMenu from "../components/HamburgerMenu";
import ViewerPopup from "../components/ViewerPopup";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const { items, isLoading, error } = useItems();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleItemClick = useCallback(
    (item) => {
      const index = items.findIndex((i) => i.id === item.id);
      setSelectedItem(item);
      setCurrentIndex(index);
      setIsModalOpen(true);
    },
    [items]
  );

  const handleClosePopup = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }, []);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  const handleNextItem = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setSelectedItem(items[currentIndex + 1]);
    }
  }, [currentIndex, items]);

  const handlePreviousItem = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setSelectedItem(items[currentIndex - 1]);
    }
  }, [currentIndex, items]);

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
      {isModalOpen && (
        <ViewerPopup
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleClosePopup}
          onNext={handleNextItem}
          onPrevious={handlePreviousItem}
        />
      )}
      <HamburgerMenu onNavigate={handleNavigate} />
    </div>
  );
}

export default React.memo(HomePage);
