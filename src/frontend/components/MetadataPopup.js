// src/frontend/components/MetadataPopup.js
import React from "react";
import styles from "../styles/MetadataPopup.module.css"; // Ensure you have this CSS file

const MetadataPopup = ({ metadata, latitude, longitude, onClose }) => {
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${latitude},${longitude}&zoom=12&maptype=satellite`;

  return (
    <div className={styles.metadataPopup}>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
      <div className={styles.content}>
        {" "}
        {/* Wrapper for centering text */}
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
    </div>
  );
};

export default MetadataPopup;
