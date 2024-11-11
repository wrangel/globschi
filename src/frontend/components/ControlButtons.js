// src/components/ControlButtons.js
import React from "react";
import styles from "../styles/ControlButtons.module.css"; // Create this CSS file

const ControlButtons = ({ onClose, onPrevious, onNext, onToggleMetadata }) => {
  return (
    <>
      <button
        className={`${styles.popupButton} ${styles.closeButton}`}
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <button
        className={`${styles.popupButton} ${styles.prevButton}`}
        onClick={onPrevious}
        aria-label="Previous image"
      >
        ‹
      </button>
      <button
        className={`${styles.popupButton} ${styles.nextButton}`}
        onClick={onNext}
        aria-label="Next image"
      >
        ›
      </button>
      <button
        className={`${styles.popupButton} ${styles.metadataButton}`}
        onClick={onToggleMetadata}
        aria-label="Toggle Metadata"
      >
        i
      </button>
    </>
  );
};

export default ControlButtons;
