// src/frontend/components/MetadataPopup.jsx

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "../styles/MetadataPopup.module.css";

/**
 * MetadataPopup component displays textual metadata and a map location.
 *
 * It listens to window resize events to switch between showing an embedded
 * Google Maps iframe or a simple link to the map based on viewport height.
 *
 * @param {Object} props - Component props.
 * @param {string} props.metadata - Text metadata to display.
 * @param {number} props.latitude - Latitude coordinate for the map.
 * @param {number} props.longitude - Longitude coordinate for the map.
 * @param {Function} props.onClose - Callback function to close the popup.
 *
 * @returns {JSX.Element} Rendered metadata popup with map or link.
 */
const MetadataPopup = ({ metadata, latitude, longitude, onClose }) => {
  // Zoom level for the embedded map
  const zoomLevel = 13;

  // State to track whether the viewport height is below threshold (500px)
  const [isBelowThreshold, setIsBelowThreshold] = useState(false);

  useEffect(() => {
    /**
     * Handler for window resize events.
     * Updates state if viewport height is below threshold.
     */
    const handleResize = () => {
      setIsBelowThreshold(window.innerHeight < 500);
    };

    // Initial check on mount
    handleResize();

    // Attach resize event listener
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Construct Google Maps embed URL with satellite view and zoom level
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  }&q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;

  // Fallback Google Maps link URL for smaller viewports
  const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;

  return (
    <div className={styles.metadataPopup}>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close metadata popup"
      >
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
            style={{ height: "50vh" }} // Responsive height for larger viewports
            src={googleMapsUrl}
            title={`Map showing location at latitude ${latitude} and longitude ${longitude}`}
            allowFullScreen
            loading="lazy"
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
