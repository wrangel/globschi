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

  /* ---------- silky drag-to-move ---------- */
  const handleDragStart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const popup = popupRef.current;
    if (!popup) return;

    // read current *pixel* position once
    const startRect = popup.getBoundingClientRect();
    const parentRect = popup.offsetParent.getBoundingClientRect();
    let baseLeft = startRect.left - parentRect.left; // absolute left
    let baseTop = startRect.top - parentRect.top; // absolute top

    // cancel any leftover transform so we work in pure px space
    popup.style.transform = "none";

    // apply absolute coords so element doesn't jump
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
      // commit final coords to React so next render matches
      setPopupPosition({ x: baseLeft, y: baseTop });
      document.removeEventListener(isTouch ? "touchmove" : "mousemove", onMove);
      document.removeEventListener(isTouch ? "touchend" : "mouseup", onUp);
    };

    document.addEventListener(isTouch ? "touchmove" : "mousemove", onMove, {
      passive: true,
    });
    document.addEventListener(isTouch ? "touchend" : "mouseup", onUp);
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
        {/* universal pill / close target */}
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
