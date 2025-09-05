// src/frontend/components/MetadataPopup.jsx

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "../styles/MetadataPopup.module.css";

/**
 * MetadataPopup renders metadata text and a draggable map iframe or link.
 *
 * Features:
 * - Shows metadata in a scrollable container.
 * - Displays Google map iframe when viewport height is above 500px,
 *   else shows a link to open Google Maps in a new tab.
 * - Popup is draggable by mouse or touch with proper event handling.
 * - Adjusts display based on window resize to toggle map vs link.
 *
 * @param {Object} props
 * @param {string} props.metadata The metadata text to display.
 * @param {number} props.latitude Latitude for map location.
 * @param {number} props.longitude Longitude for map location.
 * @param {function} props.onClose Callback to close the popup.
 */
const MetadataPopup = ({ metadata, latitude, longitude, onClose }) => {
  const zoomLevel = 13;

  const [isBelowThreshold, setIsBelowThreshold] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);

  // Monitor window height and update isBelowThreshold state
  useEffect(() => {
    const handleResize = () => {
      setIsBelowThreshold(window.innerHeight < 500);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Construct Google Maps embed and link URLs
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  }&q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;

  const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;

  // Handle dragging with mouse or touch
  const handleDragStart = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const startX =
      event.clientX ?? (event.touches ? event.touches[0].clientX : 0);
    const startY =
      event.clientY ?? (event.touches ? event.touches[0].clientY : 0);

    const initialRect = popupRef.current.getBoundingClientRect();

    const handleDrag = (e) => {
      e.stopPropagation();
      e.preventDefault();

      const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
      const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      setPopupPosition({
        x: initialRect.left + deltaX,
        y: initialRect.top + deltaY,
      });
    };

    const handleDragEnd = (e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
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
        transform: `translate(${popupPosition.x}px, ${popupPosition.y}px)`,
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
            className={styles.maplink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on map
          </a>
        ) : (
          <iframe
            title={`Map location at latitude ${latitude} and longitude ${longitude}`}
            className={styles.mapIframe}
            width="100%"
            style={{ height: "50vh" }}
            src={googleMapsUrl}
            allowFullScreen
            loading="lazy"
          />
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
