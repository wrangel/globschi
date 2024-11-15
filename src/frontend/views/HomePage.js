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

  const handleNavigate = (path) => {
    navigate(path); // Use navigate to go to a new path
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
      <button onClick={() => handleNavigate("/some-path")}>
        Go to Some Path
      </button>{" "}
      {/* Example usage */}
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
