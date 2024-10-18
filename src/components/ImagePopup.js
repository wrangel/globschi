// src/components/ImagePopup.js
import React, { useEffect, useRef, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import PanoramaViewer from "./PanoramaViewer";

function ImagePopup({ item, onClose, onNext, onPrevious }) {
  const popupRef = useRef(null);

  const handleKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrevious();
          break;
        case "ArrowRight":
          onNext();
          break;
        default:
          break;
      }
    },
    [onClose, onPrevious, onNext]
  );

  const handleClickOutside = useCallback(
    (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (!item) return null;

  const renderContent = () => {
    if (item.type === "pan") {
      return (
        <div className="panorama-container">
          <PanoramaViewer url={item.actualUrl} />
        </div>
      );
    } else {
      return <img src={item.actualUrl} alt={item.name} />;
    }
  };

  return (
    <div className="image-popup" {...swipeHandlers}>
      <div className="image-popup-content" ref={popupRef}>
        {renderContent()}
        <button className="close-button" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <button
          className="nav-button prev"
          onClick={onPrevious}
          aria-label="Previous"
        >
          &#8249;
        </button>
        <button className="nav-button next" onClick={onNext} aria-label="Next">
          &#8250;
        </button>
      </div>
    </div>
  );
}

export default ImagePopup;
