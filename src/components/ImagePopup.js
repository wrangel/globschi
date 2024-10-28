// src/components/ImagePopup.js

import React, { useRef, useCallback, useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import PanoramaViewer from "./PanoramaViewer";

function ImagePopup({ item, onClose, onNext, onPrevious }) {
  const popupRef = useRef(null);
  const [isPanoramaInteracting, setIsPanoramaInteracting] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  const handlePanoramaInteractionStart = useCallback(() => {
    setIsPanoramaInteracting(true);
  }, []);

  const handlePanoramaInteractionEnd = useCallback(() => {
    setIsPanoramaInteracting(false);
  }, []);

  const toggleMetadata = useCallback(() => {
    setShowMetadata((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        if (showMetadata) {
          setShowMetadata(false);
        } else {
          onClose();
        }
      } else if (event.key === "ArrowLeft") {
        onPrevious(); // Navigate to the previous image
      } else if (event.key === "ArrowRight") {
        onNext(); // Navigate to the next image
      }
    },
    [onClose, showMetadata, onNext, onPrevious]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: isPanoramaInteracting ? null : onNext,
    onSwipedRight: isPanoramaInteracting ? null : onPrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const renderMetadata = () => (
    <div className={`metadata-popup ${showMetadata ? "visible" : ""}`}>
      <pre>{item.metadata}</pre>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="map-link"
      >
        View on Map
      </a>
    </div>
  );

  const renderContent = () =>
    item.viewer === "pano" ? (
      <div className="panorama-container">
        <PanoramaViewer
          url={item.actualUrl}
          onInteractionStart={handlePanoramaInteractionStart}
          onInteractionEnd={handlePanoramaInteractionEnd}
        />
      </div>
    ) : (
      <img src={item.actualUrl} alt={item.name} />
    );

  if (!item) return null;

  return (
    <div className="image-popup" {...swipeHandlers}>
      <div className="image-popup-content" ref={popupRef}>
        {renderContent()}
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
          disabled={isPanoramaInteracting}
        >
          ‹
        </button>
        <button
          className="popup-button nav-button next"
          onClick={onNext}
          aria-label="Next"
          disabled={isPanoramaInteracting}
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
