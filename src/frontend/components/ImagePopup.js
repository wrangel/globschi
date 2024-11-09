// src/components/ImagePopup.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDrag, usePinch } from "@use-gesture/react";

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
          imgRef.current.classList.add("loaded");
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
    <div className={`metadata-popup ${showMetadata ? "visible" : ""}`}>
      <pre>{item.metadata}</pre>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}&maptype=satellite`}
        target="_blank"
        rel="noopener noreferrer"
        className="map-link"
      >
        View on Map
      </a>
    </div>
  );

  return (
    <div className="image-popup">
      <div className="image-popup-content" ref={popupRef}>
        <div
          className="image-container"
          {...bindDrag()}
          {...bindPinch()}
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          }}
        >
          {isLoading && <div className="loading-spinner"></div>}
          <img
            ref={imgRef}
            src={item.actualUrl}
            alt={item.name}
            className={isLoading ? "hidden" : "loaded"}
            onLoad={() => setIsLoading(false)}
          />
        </div>
        <button
          className="popup-button close-button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <button
          className="popup-button nav-button prev"
          onClick={onPrevious}
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          className="popup-button nav-button next"
          onClick={onNext}
          aria-label="Next"
        >
          ›
        </button>
        <button
          className="popup-button metadata-button"
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
