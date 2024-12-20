// src/frontend/components/GlobeButton.js

import React from "react";
import styles from "../styles/Fab.module.css";

const GlobeButton = () => {
  return (
    <button className={styles.fab} aria-label="Toggle Mode">
      🌍 {/* Globe icon */}
    </button>
  );
};

export default GlobeButton;
