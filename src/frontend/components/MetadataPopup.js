import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "../styles/MetadataPopup.module.css";

const MetadataPopup = ({ metadata, latitude, longitude, onClose }) => {
  const zoomLevel = useState(13); // Initial zoom level
  const [isBelowThreshold, setIsBelowThreshold] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsBelowThreshold(window.innerHeight < 500); // Adjust threshold as needed
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;
  const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;

  return (
    <div className={styles.metadataPopup}>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
      <div className={styles.content}>
        <pre>{metadata}</pre>
        {isBelowThreshold ? (
          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.maplink}
          >
            View on map
          </a>
        ) : (
          <iframe
            className={styles.mapIframe}
            width="100%"
            style={{ height: "50vh" }} // Responsive height
            src={googleMapsUrl}
            title={`Map showing location at latitude ${latitude} and longitude ${longitude}`}
            allowFullScreen
          ></iframe>
        )}
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
