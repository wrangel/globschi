import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
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
      className={styles.fabContainer}
      style={{ zIndex: 1100 }} // Ensure correct z-index for ControlButtons
      {...handlers}
    >
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
            <button
              className={styles.fab}
              onClick={toggleMode}
              aria-label="Toggle Mode"
            >
              🌍 {/* Globe icon */}
            </button>
          )}
          <button
            className={`${styles.fab} ${styles.mainFab}`}
            onClick={toggleMenu}
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
    </div>
  );
};

export default ControlButtons;
