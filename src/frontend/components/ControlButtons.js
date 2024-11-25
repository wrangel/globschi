// src/frontend/components/ControlButtons.js

import React, { useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import styles from "../styles/ControlButtons.module.css";

const ControlButtons = ({ onClose, onPrevious, onNext, onToggleMetadata }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        onPrevious();
      } else if (event.key === "ArrowRight") {
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onPrevious, onNext]);

  const handlers = useSwipeable({
    onSwipedLeft: onNext,
    onSwipedRight: onPrevious,
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
