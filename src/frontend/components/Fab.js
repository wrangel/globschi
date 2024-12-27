// src/frontend/components/Fab.js

import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/Fab.module.css";

const Fab = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleFab = () => {
    setIsOpen(!isOpen);
  };

  // Define the button configurations based on the current location
  const buttonConfig = {
    "/": [
      { label: "About", path: "/about" },
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
    ],
    "/grid": [
      { label: "About", path: "/about" },
      { label: "Map", path: "/map" },
    ],
    "/map": [
      { label: "About", path: "/about" },
      { label: "Grid", path: "/grid" },
    ],
    "/about": [
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
    ],
  };

  const renderButtons = () => {
    const buttons = buttonConfig[location.pathname] || [];

    return buttons.map((button) => (
      <button
        key={button.path}
        className={styles.fab}
        onClick={() => {
          onNavigate(button.path);
          setIsOpen(false);
        }}
        aria-label={`Go to ${button.label}`}
      >
        {button.label}
      </button>
    ));
  };

  return (
    <div className={styles.fabContainer} style={{ zIndex: 950 }}>
      {isOpen ? (
        <div className={styles.fabMenu}>
          {renderButtons()}
          {/* Only show Home button if not on the homepage */}
          {location.pathname !== "/" && (
            <button
              className={`${styles.fab} ${styles.mainFab}`}
              onClick={() => {
                onNavigate("/");
                setIsOpen(false);
              }}
              aria-label="Go to Home"
            >
              Home
            </button>
          )}
        </div>
      ) : (
        <button
          className={`${styles.fab} ${styles.mainFab}`}
          onClick={toggleFab}
          aria-label="Navigation"
        >
          Views
        </button>
      )}
    </div>
  );
};

export default Fab;
