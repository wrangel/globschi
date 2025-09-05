// src/frontend/components/Fab2.jsx

import { useState, useEffect } from "react";
import styles from "../styles/Fab.module.css";

const Fab2 = ({
  onClose,
  onPrevious,
  onNext,
  onToggleMetadata,
  isNavigationMode,
  onToggleFullScreen,
}) => {
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
            Full
          </button>

          <button
            className={styles.fab}
            onClick={onToggleMetadata}
            aria-label="Toggle Metadata"
          >
            Info
          </button>

          <button
            className={`${styles.fab}`}
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </button>
        </div>
      )}

      {isFullscreen && (
        <button
          className={`${styles.fab}`}
          onClick={onClose}
          aria-label="Close"
        >
          Close
        </button>
      )}
    </div>
  );
};

export default Fab2;
