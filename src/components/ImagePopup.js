// src/components/ImagePopup.js

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useSwipeable } from "react-swipeable";
import PanoramaViewer from "./PanoramaViewer";

function ImagePopup({ item, onClose, onNext, onPrevious }) {
  const popupRef = useRef(null);
  const [isPanoramaInteracting, setIsPanoramaInteracting] = useState(false);

  const handleKeyDown = useCallback(
    (event) => {
      if (isPanoramaInteracting) return;
      const keyActions = {
        Escape: onClose,
        ArrowLeft: onPrevious,
        ArrowRight: onNext,
      };
      if (keyActions[event.key]) keyActions[event.key]();
    },
    [onClose, onPrevious, onNext, isPanoramaInteracting]
  );

  const handleClickOutside = useCallback(
    (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    },
    [onClose]
  );

  const handlePanoramaInteractionStart = useCallback(() => {
    setIsPanoramaInteracting(true);
  }, []);

  const handlePanoramaInteractionEnd = useCallback(() => {
    setIsPanoramaInteracting(false);
  }, []);

  useEffect(() => {
    const events = ["keydown", "mousedown", "touchstart"];
    events.forEach((event) =>
      document.addEventListener(
        event,
        event === "keydown" ? handleKeyDown : handleClickOutside
      )
    );

    return () => {
      events.forEach((event) =>
        document.removeEventListener(
          event,
          event === "keydown" ? handleKeyDown : handleClickOutside
        )
      );
    };
  }, [handleKeyDown, handleClickOutside]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: isPanoramaInteracting ? null : onNext,
    onSwipedRight: isPanoramaInteracting ? null : onPrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (!item) return null;

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
          disabled={isPanoramaInteracting}
        >
          &#8249;
        </button>
        <button
          className="nav-button next"
          onClick={onNext}
          aria-label="Next"
          disabled={isPanoramaInteracting}
        >
          &#8250;
        </button>
      </div>
    </div>
  );
}

export default ImagePopup;
