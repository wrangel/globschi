// src/components/ImagePopup.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import { useDrag, usePinch } from "@use-gesture/react";
import PanoramaViewer from "./PanoramaViewer";

function ImagePopup({ item, onClose, onNext, onPrevious }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showMetadata, setShowMetadata] = useState(false);
  const [isPanoramaInteracting, setIsPanoramaInteracting] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (item && item.viewer !== "pano") {
      setIsLoading(true);
      setScale(1);
      setPosition({ x: 0, y: 0 });
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

  const bindDrag = useDrag(({ offset: [x, y] }) => {
    setPosition({ x, y });
  });

  const bindPinch = usePinch(({ offset: [d] }) => {
    setScale(Math.max(1, Math.min(5, d)));
  });

  const handlePanoramaInteractionStart = useCallback(() => {
    setIsPanoramaInteracting(true);
  }, []);

  const handlePanoramaInteractionEnd = useCallback(() => {
    setIsPanoramaInteracting(false);
  }, []);

  const toggleMetadata = useCallback(() => {
    setShowMetadata((prev) => !prev);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setScale(scale === 1 ? 2 : 1);
    setPosition({ x: 0, y: 0 });
  }, [scale]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        if (showMetadata) {
          setShowMetadata(false);
        } else if (scale !== 1) {
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          onClose();
        }
      } else if (event.key === "ArrowLeft" && scale === 1) {
        onPrevious();
      } else if (event.key === "ArrowRight" && scale === 1) {
        onNext();
      }
    },
    [onClose, showMetadata, onNext, onPrevious, scale]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: isPanoramaInteracting || scale !== 1 ? null : onNext,
    onSwipedRight: isPanoramaInteracting || scale !== 1 ? null : onPrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

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
      <div
        className="image-container"
        {...bindDrag()}
        {...bindPinch()}
        onDoubleClick={handleDoubleClick}
        onWheel={(e) => {
          e.preventDefault();
          setScale((current) =>
            Math.max(1, Math.min(5, current - e.deltaY / 500))
          );
        }}
      >
        {isLoading && <div className="loading-spinner"></div>}
        <img
          ref={imgRef}
          src={item.thumbnailUrl || item.actualUrl}
          alt={item.name}
          className={isLoading ? "loading" : "loaded"}
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transition: isLoading ? "none" : "transform 0.2s",
            transformOrigin: "0 0",
          }}
        />
      </div>
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
          disabled={isPanoramaInteracting || scale !== 1}
        >
          ‹
        </button>
        <button
          className="popup-button nav-button next"
          onClick={onNext}
          aria-label="Next"
          disabled={isPanoramaInteracting || scale !== 1}
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
