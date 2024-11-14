// src/frontend/components/MetadataPopup.js
import React from "react";
import styles from "../styles/MetadataPopup.module.css"; // Ensure you have this CSS file

const MetadataPopup = ({ metadata, latitude, longitude, onClose }) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className={styles.metadataPopup}>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
      <pre>{metadata}</pre>
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.mapLink}
      >
        View on Map
      </a>
    </div>
  );
};

export default MetadataPopup;
