// src/views/HomePage.js

import React from "react";
import PortfolioGrid from "../components/PortfolioGrid";
import styles from "../styles/Home.module.css";
import { useItems } from "../hooks/useItems";

function HomePage() {
  const { items, isLoading, error } = useItems();

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
        <PortfolioGrid items={items} />
      ) : (
        <p>No items to display.</p>
      )}
    </div>
  );
}

export default React.memo(HomePage);
