// src/frontend/components/LoadingOverlay.js

import React from "react";
import styles from "../styles/LoadingOverlay.module.css";

const LoadingOverlay = ({ thumbnailUrl }) => {
  return (
    <div className={styles.loadingOverlay}>
      {thumbnailUrl && (
        <img src={thumbnailUrl} alt="Thumbnail" className={styles.thumbnail} />
      )}
      <div className={styles.spinner}></div>
    </div>
  );
};

export default LoadingOverlay;
