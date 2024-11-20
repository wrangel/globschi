import React from "react";
import styles from "../styles/MetadataPopup.module.css";

const MetadataPopup = ({ metadata, latitude, longitude, onClose }) => {
  console.log("DDDDD", latitude, longitude);
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/view?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&center=${latitude},${longitude}&zoom=12&maptype=satellite`;

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
          frameBorder="0"
          style={{ border: 0 }}
          src={googleMapsUrl}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default MetadataPopup;
