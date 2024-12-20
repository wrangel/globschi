import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import GlobeButton from "./GlobeButton"; // Import GlobeButton component
import styles from "../styles/Fab.module.css"; // Use Fab styles for consistency

const ControlButtons = ({
  onClose,
  onPrevious,
  onNext,
  onToggleMetadata,
  isNavigationMode,
  toggleMode,
  isPano,
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

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={`${styles.fabContainer} ${
        isFullscreen ? styles.fullscreen : ""
      }`}
      style={{ zIndex: 1100 }}
      {...handlers}
    >
      {!isFullscreen ? (
        <>
          {isOpen ? (
            <div className={styles.fabMenu}>
              <button
                className={styles.fab}
                onClick={onToggleFullScreen}
                aria-label="Full Screen"
              >
                ⛶ {/* Fullscreen icon */}
              </button>
              <button
                className={styles.fab}
                onClick={onToggleMetadata}
                aria-label="Toggle Metadata"
              >
                i {/* Info icon */}
              </button>
              {isPano && (
                <GlobeButton onClick={toggleMode} /> // Use GlobeButton component
              )}
              <button
                className={`${styles.fab} ${styles.mainFab}`}
                onClick={onClose} // Ensure it closes the viewer
                aria-label="Close"
              >
                × {/* Close icon */}
              </button>
            </div>
          ) : (
            <button
              className={`${styles.fab} ${styles.mainFab}`}
              onClick={toggleMenu}
              aria-label="Navigation"
            >
              Nav
            </button>
          )}
        </>
      ) : (
        <button
          className={`${styles.fab} ${styles.fullscreenButton}`}
          onClick={onClose} // Ensure it closes the viewer
          aria-label="Close"
        >
          × {/* Close icon */}
        </button>
      )}
    </div>
  );
};

export default ControlButtons;
