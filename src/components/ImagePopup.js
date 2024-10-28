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
      }
    },
    [onClose, showMetadata]
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
      <ul>
        <li>Date: {item.dateTime}</li>
        <li>
          Location: {item.location}, {item.region}, {item.country}
        </li>
        <li>
          Coordinates: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </li>
        <li>Altitude: {item.altitude}</li>
        <li>Postal Code: {item.postalCode}</li>
        {item.road && <li>Road: {item.road}</li>}
        <li>Views: {item.noViews}</li>
      </ul>
    </div>
  );

  const renderContent = () =>
    item.type === "pan" ? (
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
