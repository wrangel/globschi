// src/frontend/components/MetadataPopup.js
import React from "react";
import styles from "../styles/MetadataPopup.module.css"; // Create this CSS file for styling

const MetadataPopup = ({ metadata, onClose }) => {
  return (
    <div className={styles.metadataPopup}>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
      <pre>{metadata}</pre> {/* Use <pre> for preserving formatting */}
    </div>
  );
};

export default MetadataPopup;
