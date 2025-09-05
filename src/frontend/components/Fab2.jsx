// src/frontend/components/Fab2.jsx

import { useState, useEffect } from "react";
import styles from "../styles/Fab.module.css";

/**
 * Fab2 Component with arrows only, no swipe navigation.
 *
 * Displays navigation arrows and controls.
 * Navigation happens only by clicking arrows.
 *
 * Props and functions unchanged.
 */
const Fab2 = ({
  onClose,
  onPrevious,
  onNext,
  onToggleMetadata,
  isNavigationMode,
  onToggleFullScreen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard arrow navigation can stay or be removed—your choice.
  // If you want only mouse clicks on arrows, remove this effect.

  return (
    <div
      className={`${styles.fabContainer} ${
        isFullscreen ? styles.fullscreen : ""
      }`}
      style={{ zIndex: 1100 }}
    >
      {isNavigationMode && !isFullscreen && (
        <>
          <button
            className={styles.leftArrow}
            aria-label="Previous"
            onClick={onPrevious}
          >
            ←
          </button>
          <button
            className={styles.rightArrow}
            aria-label="Next"
            onClick={onNext}
          >
            →
          </button>
        </>
      )}

      {!isFullscreen && (
        <div className={styles.fabMenu}>
          <button
            className={styles.fab}
            onClick={onToggleFullScreen}
            aria-label="Full Screen"
          >
            ⛶
          </button>

          <button
            className={styles.fab}
            onClick={onToggleMetadata}
            aria-label="Toggle Metadata"
          >
            i
          </button>

          <button
            className={`${styles.fab} ${styles.mainFab}`}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      {isFullscreen && (
        <button
          className={`${styles.fab} ${styles.fullscreenButton}`}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Fab2;
