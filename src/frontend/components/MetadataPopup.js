// src/frontend/components/MetadataPopup.js

import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "../styles/MetadataPopup.module.css";

const MetadataPopup = ({ metadata, latitude, longitude, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(18); // Initial zoom level

  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;

  const zoomOutTwoSteps = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 2, 0)); // Decrease zoom level by 2
  };

  return (
    <div className={styles.metadataPopup}>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
      <div className={styles.content}>
        <pre>{metadata}</pre>
        <iframe
          className={styles.mapIframe}
          width="100%"
          style={{ height: "50vh" }} // Responsive height
          src={googleMapsUrl}
          title={`Map showing location at latitude ${latitude} and longitude ${longitude}`}
          allowFullScreen
        ></iframe>
        <button onClick={zoomOutTwoSteps} className={styles.zoomButton}>
          Zoom Out Two Steps
        </button>
      </div>
    </div>
  );
};

MetadataPopup.propTypes = {
  metadata: PropTypes.string.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MetadataPopup;
