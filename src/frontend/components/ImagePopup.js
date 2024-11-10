// src/frontend/components/ImagePopup.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDrag, usePinch } from "@use-gesture/react";
import styles from "../styles/ImagePopup.module.css";

function ImagePopup({ item, onClose, onNext, onPrevious }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showMetadata, setShowMetadata] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const popupRef = useRef(null);

  // Load image
  useEffect(() => {
    if (item) {
      setIsLoading(true);
      const img = new Image();
      img.src = item.actualUrl;
      img.onload = () => {
        setIsLoading(false);
        if (imgRef.current) {
          imgRef.current.src = item.actualUrl;
          imgRef.current.classList.add(styles.loaded);
        }
      };
    }
  }, [item]);

  // Gesture bindings
  const bindDrag = useDrag(({ offset: [x, y] }) => {
    setPosition({ x, y });
  });

  const bindPinch = usePinch(({ offset: [d] }) => {
    setScale(Math.max(1, Math.min(5, d)));
  });

  // Toggle metadata
  const toggleMetadata = useCallback(() => {
    setShowMetadata((prev) => !prev);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        onPrevious();
      } else if (event.key === "ArrowRight") {
        onNext();
      }
    },
    [onClose, onNext, onPrevious]
  );

  // Event listeners for keyboard navigation
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Render metadata
  const renderMetadata = () => (
    <div
      className={`${styles.metadataPopup} ${
        showMetadata ? styles.visible : ""
      }`}
    >
      <pre>{item.metadata}</pre>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}&maptype=satellite`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.mapLink}
      >
        View on Map
      </a>
    </div>
  );

  return (
    <div className={styles.imagePopup}>
      <div className={styles.imagePopupContent} ref={popupRef}>
        <div
          className={styles.imageContainer}
          {...bindDrag()}
          {...bindPinch()}
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          }}
        >
          {isLoading && <div className={styles.loadingSpinner}></div>}
          <img
            ref={imgRef}
            src={item.actualUrl}
            alt={item.name}
            className={`${styles.image} ${
              isLoading ? styles.hidden : styles.loaded
            }`}
            onLoad={() => setIsLoading(false)}
          />
        </div>
        <button
          className={`${styles.popupButton} ${styles.closeButton}`}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <button
          className={`${styles.popupButton} ${styles.navButton} ${styles.prevButton}`}
          onClick={onPrevious}
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          className={`${styles.popupButton} ${styles.navButton} ${styles.nextButton}`}
          onClick={onNext}
          aria-label="Next"
        >
          ›
        </button>
        <button
          className={`${styles.popupButton} ${styles.metadataButton}`}
          onClick={toggleMetadata}
          aria-label="Toggle Metadata"
        >
          i
        </button>
        {renderMetadata()}
      </div>
    </div>
  );
}

export default ImagePopup;
