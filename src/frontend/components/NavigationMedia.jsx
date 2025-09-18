// src/frontend/components/NavigationMedia.jsx

import React, { memo, useState, useEffect } from "react";
import styles from "../styles/Navigation.module.css";

const NavigationMedia = memo(
  ({
    onClose,
    onPrevious,
    onNext,
    onToggleMetadata,
    isNavigationMode,
    onToggleFullScreen,
    isFirst,
    isLast,
  }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => {
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
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
        role="navigation"
        aria-label="Media navigation controls"
      >
        {isNavigationMode && !isFullscreen && (
          <>
            {!isFirst && (
              <button
                className={styles.leftArrow}
                aria-label="Previous media"
                onClick={onPrevious}
                type="button"
              >
                ←
              </button>
            )}
            {!isLast && (
              <button
                className={styles.rightArrow}
                aria-label="Next media"
                onClick={onNext}
                type="button"
              >
                →
              </button>
            )}
          </>
        )}

        {!isFullscreen && (
          <div className={styles.fabMenu}>
            <button
              className={styles.fab}
              onClick={onToggleFullScreen}
              aria-label="Enter full screen"
              type="button"
            >
              Full
            </button>

            <button
              className={styles.fab}
              onClick={onToggleMetadata}
              aria-label="Toggle metadata panel"
              type="button"
            >
              Info
            </button>

            <button
              className={`${styles.fab}`}
              onClick={handleClose}
              aria-label="Close media navigation"
              type="button"
            >
              Close
            </button>
          </div>
        )}

        {isFullscreen && (
          <button
            className={`${styles.fab}`}
            onClick={handleClose}
            aria-label="Exit full screen and close"
            type="button"
          >
            Close
          </button>
        )}
      </div>
    );
  }
);

export default NavigationMedia;
