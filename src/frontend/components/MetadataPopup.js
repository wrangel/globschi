import React from "react";
import styles from "../styles/MetadataPopup.module.css";

const MetadataPopup = ({ metadata, latitude, longitude, onClose }) => {
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}&zoom=18&maptype=satellite`;

  return (
    <div className={styles.metadataPopup}>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
      <div className={styles.content}>
        <pre>{metadata}</pre>
        <iframe
          width="100%"
          height="450"
          style={{ border: 0 }} // Use CSS for border styling
          src={googleMapsUrl}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default MetadataPopup;
