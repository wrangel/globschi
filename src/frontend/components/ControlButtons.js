// src/frontend/components/ControlButtons.js

import React, { useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import styles from "../styles/ControlButtons.module.css";

const ControlButtons = ({
  onClose,
  onPrevious,
  onNext,
  onToggleMetadata,
  isNavigationMode,
  toggleMode,
  isPano,
  onToggleFullScreen, // New prop for handling full-screen toggle
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" && isNavigationMode) {
        onPrevious();
      } else if (event.key === "ArrowRight" && isNavigationMode) {
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPrevious, onNext, isNavigationMode]);

  const handlers = useSwipeable({
    onSwipedLeft: () => isNavigationMode && onNext(),
    onSwipedRight: () => isNavigationMode && onPrevious(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div {...handlers}>
      <button
        className={`${styles.popupButton} ${styles.closeButton}`}
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      {isPano && (
        <button
          className={`${styles.popupButton} ${styles.toggleButton} ${styles.greyscaleIcon}`}
          onClick={toggleMode}
          aria-label="Toggle Mode"
        >
          {isNavigationMode ? "<>" : "🌍"}{" "}
        </button>
      )}
      <button
        className={`${styles.popupButton} ${styles.fullScreenButton}`}
        onClick={onToggleFullScreen} // Handle full-screen toggle
        aria-label="Full Screen"
      >
        ⛶
      </button>
      {onToggleMetadata && (
        <button
          className={`${styles.popupButton} ${styles.metadataButton}`}
          onClick={onToggleMetadata}
          aria-label="Toggle Metadata"
        >
          i
        </button>
      )}
    </div>
  );
};

export default ControlButtons;
