// src/frontend/components/MetadataPopup.jsx

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "../styles/MetadataPopup.module.css";

const SWIPE_THRESHOLD = 60; // px

const MetadataPopup = ({ metadata, latitude, longitude, onClose }) => {
  const zoomLevel = 13;
  const [isBelowThreshold, setIsBelowThreshold] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);
  const dragRef = useRef({ startY: 0, dragging: false });

  useEffect(() => {
    const handleResize = () => setIsBelowThreshold(window.innerHeight < 500);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  }&q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;
  const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;

  /* ---------- drag-to-move (desktop) ---------- */
  const handleDragStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    const startY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);
    const initialRect = popupRef.current.getBoundingClientRect();

    const onMove = (ev) => {
      const x = ev.clientX ?? (ev.touches ? ev.touches[0].clientX : 0);
      const y = ev.clientY ?? (ev.touches ? ev.touches[0].clientY : 0);
      setPopupPosition({
        x: initialRect.left + (x - startX),
        y: initialRect.top + (y - startY),
      });
    };
    const onEnd = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchend", onEnd);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchend", onEnd);
  };

  /* ---------- swipe-down-to-dismiss ---------- */
  const onTouchStart = (e) => {
    dragRef.current.startY = e.touches[0].clientY;
    dragRef.current.dragging = true;
  };
  const onTouchMove = (e) => {
    if (!dragRef.current.dragging) return;
    const deltaY = e.touches[0].clientY - dragRef.current.startY;
    if (deltaY > 0) setPopupPosition((p) => ({ ...p, y: deltaY }));
  };
  const onTouchEnd = (e) => {
    dragRef.current.dragging = false;
    const deltaY = e.changedTouches[0].clientY - dragRef.current.startY;
    if (deltaY > SWIPE_THRESHOLD) onClose();
    else setPopupPosition({ x: 0, y: 0 }); // snap back
  };

  return (
    <>
      {/* invisible backdrop: tap outside to close */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      <div
        className={styles.metadataPopup}
        ref={popupRef}
        style={{
          transform: `translate(${popupPosition.x}px, ${popupPosition.y}px)`,
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* modern pill / close button */}
        <button
          className={styles.dragPill}
          onClick={onClose}
          onTouchEnd={(e) => {
            e.preventDefault();
            onClose();
          }}
          aria-label="Close metadata popup"
          type="button"
        />

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
              title={`Map lat:${latitude} lng:${longitude}`}
              allowFullScreen
              loading="lazy"
            />
          )}
        </div>
      </div>
    </>
  );
};

MetadataPopup.propTypes = {
  metadata: PropTypes.string.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MetadataPopup;
