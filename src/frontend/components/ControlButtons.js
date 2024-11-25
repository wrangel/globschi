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
      <button
        className={`${styles.popupButton} ${styles.toggleButton}`}
        onClick={toggleMode}
        aria-label="Toggle Mode"
      >
        {isNavigationMode ? "← →" : "🌍"}{" "}
        {/* Use arrows for navigation mode and globe for interaction mode */}
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
