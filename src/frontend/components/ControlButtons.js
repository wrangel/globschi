// src/frontend/components/ControlButtons.js
import React from "react";
import styles from "../styles/ControlButtons.module.css";

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
      {onToggleMetadata && (
        <button
          className={`${styles.popupButton} ${styles.metadataButton}`}
          onClick={onToggleMetadata}
          aria-label="Toggle Metadata"
        >
          i
        </button>
      )}
    </>
  );
};

export default ControlButtons;
