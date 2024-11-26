// src/components/Fab.js
import React, { useState } from "react";
import styles from "../styles/Fab.module.css";

const Fab = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFab = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.fabContainer}>
      {isOpen ? (
        // Render only the navigation buttons when expanded
        <div className={styles.fabMenu}>
          <button
            className={styles.fab}
            onClick={() => {
              onNavigate("/");
              setIsOpen(false);
            }}
            aria-label="Go to Home"
          >
            Home
          </button>
          <button
            className={styles.fab}
            onClick={() => {
              onNavigate("/grid");
              setIsOpen(false);
            }}
            aria-label="Go to Grid"
          >
            Grid
          </button>
          <button
            className={styles.fab}
            onClick={() => {
              onNavigate("/map");
              setIsOpen(false);
            }}
            aria-label="Go to Map"
          >
            Map
          </button>
          <button
            className={styles.fab}
            onClick={() => {
              onNavigate("/about");
              setIsOpen(false);
            }}
            aria-label="Go to About"
          >
            About
          </button>
        </div>
      ) : (
        // Render the main FAB button when not expanded
        <button
          className={`${styles.fab} ${styles.mainFab}`}
          onClick={toggleFab}
          aria-label="Navigation"
        >
          Nav
        </button>
      )}
    </div>
  );
};

export default Fab;
