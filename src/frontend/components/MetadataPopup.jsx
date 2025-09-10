// src/frontend/components/MetadataPopup.jsx

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "../styles/MetadataPopup.module.css";

const MetadataPopup = ({
  metadata,
  latitude,
  longitude,
  onClose,
  isVisible,
}) => {
  const zoomLevel = 13;
  const [isBelowThreshold, setIsBelowThreshold] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);
  const triggerRef = useRef(null);

  // Track window resize to toggle map vs link display
  useEffect(() => {
    const handleResize = () => setIsBelowThreshold(window.innerHeight < 500);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Focus management to restore focus on close
  useEffect(() => {
    if (isVisible) {
      triggerRef.current = document.activeElement;
      popupRef.current?.focus();
    } else {
      triggerRef.current?.focus?.();
    }
  }, [isVisible]);

  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  }&q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;
  const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}&zoom=${zoomLevel}&maptype=satellite`;

  // Draggable popup logic
  const handleDragStart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const popup = popupRef.current;
    if (!popup) return;

    const startRect = popup.getBoundingClientRect();
    const parentRect = popup.offsetParent.getBoundingClientRect();

    let baseLeft = startRect.left - parentRect.left;
    let baseTop = startRect.top - parentRect.top;

    // Remove transform to work with pure px positioning
    popup.style.transform = "none";
    popup.style.left = `${baseLeft}px`;
    popup.style.top = `${baseTop}px`;

    const isTouch = e.type === "touchstart";
    const pointer = isTouch ? e.touches[0] : e;
    let lastX = pointer.clientX;
    let lastY = pointer.clientY;

    const onMove = (ev) => {
      const p = isTouch ? ev.touches[0] : ev;
      baseLeft += p.clientX - lastX;
      baseTop += p.clientY - lastY;
      lastX = p.clientX;
      lastY = p.clientY;
      popup.style.left = `${baseLeft}px`;
      popup.style.top = `${baseTop}px`;
    };

    const onUp = () => {
      setPopupPosition({ x: baseLeft, y: baseTop });
      document.removeEventListener(isTouch ? "touchmove" : "mousemove", onMove);
      document.removeEventListener(isTouch ? "touchend" : "mouseup", onUp);
    };

    document.addEventListener(isTouch ? "touchmove" : "mousemove", onMove, {
      passive: true,
    });
    document.addEventListener(isTouch ? "touchend" : "mouseup", onUp);
  };

  // Use style with left/top from drag or default initial, and control visibility
  const style = {
    ...(popupPosition.x === 0 && popupPosition.y === 0
      ? {} // use CSS positioning (top/left from CSS)
      : {
          transform: "none",
          left: `${popupPosition.x}px`,
          top: `${popupPosition.y}px`,
          position: "absolute",
        }),
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? "auto" : "none",
  };

  return (
    <div
      className={styles.metadataPopup}
      ref={popupRef}
      style={style}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label="Metadata popup"
    >
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
            title={`Map location at latitude ${latitude} and longitude ${longitude}`}
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
  isVisible: PropTypes.bool.isRequired,
};

export default MetadataPopup;
