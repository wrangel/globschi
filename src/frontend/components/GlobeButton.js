// src/frontend/components/GlobeButton.js

import React from "react";
import styles from "../styles/Fab.module.css";

const GlobeButton = ({ onClick }) => {
  return (
    <button className={styles.fab} onClick={onClick} aria-label="Toggle Mode">
      🌍 {/* Globe icon */}
    </button>
  );
};

export default GlobeButton;
