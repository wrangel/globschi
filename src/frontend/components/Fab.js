// src/components/Fab.js
import React from "react";
import styles from "../styles/Fab.module.css";

const Fab = ({ onNavigate }) => {
  return (
    <div className={styles.fabContainer}>
      <button
        className={styles.fab}
        onClick={() => onNavigate("/")}
        aria-label="Go to Home"
      >
        Home
      </button>
      <button
        className={styles.fab}
        onClick={() => onNavigate("/grid")}
        aria-label="Go to Grid"
      >
        Grid
      </button>
      <button
        className={styles.fab}
        onClick={() => onNavigate("/map")}
        aria-label="Go to Map"
      >
        Map
      </button>
      <button
        className={styles.fab}
        onClick={() => onNavigate("/about")}
        aria-label="Go to About"
      >
        About
      </button>
    </div>
  );
};

export default Fab;
