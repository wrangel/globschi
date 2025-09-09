// src/frontend/components/NavigationMedia.jsx

import { useState, useEffect } from "react";
import styles from "../styles/Navigation.module.css";

const NavigationMedia = ({
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

  const handleClose = () => {
    if (isFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.error(
          `Error attempting to exit full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      onClose();
    }
  };

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
            onClick={handleClose}
            aria-label="Close"
          >
            Close
          </button>
        </div>
      )}

      {isFullscreen && (
        <button
          className={`${styles.fab}`}
          onClick={handleClose}
          aria-label="Close"
        >
          Close
        </button>
      )}
    </div>
  );
};

export default NavigationMedia;
