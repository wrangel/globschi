// src/frontend/components/MetadataPopup.jsx

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "../styles/MetadataPopup.module.css";

const MetadataPopup = ({ metadata, latitude, longitude, onClose }) => {
  const zoomLevel = 13;
  const [isBelowThreshold, setIsBelowThreshold] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsBelowThreshold(window.innerHeight < 500);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  }&q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;
  const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;

  const handleDragStart = (e) => {
    const startX = e.clientX || e.touches[0].clientX;
    const startY = e.clientY || e.touches[0].clientY;
    const initialPosition = popupRef.current.getBoundingClientRect();

    const handleDrag = (e) => {
      const deltaX = (e.clientX || e.touches[0].clientX) - startX;
      const deltaY = (e.clientY || e.touches[0].clientY) - startY;
      setPopupPosition({
        x: initialPosition.left + deltaX,
        y: initialPosition.top + deltaY,
      });
    };

    const handleDragEnd = () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("touchmove", handleDrag);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchend", handleDragEnd);
    };

    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("touchmove", handleDrag, { passive: false });
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);
  };

  return (
    <div
      className={styles.metadataPopup}
      ref={popupRef}
      style={{
        top: `${popupPosition.y}px`,
        left: `${popupPosition.x}px`,
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
    >
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
            style={{ height: "50vh" }}
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
