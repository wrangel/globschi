// src/frontend/components/ControlButtons.jsx

import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import styles from "../styles/Fab.module.css";

/**
 * ControlButtons Component
 *
 * Displays floating action buttons (FAB) for navigation controls including:
 * - Close button
 * - Previous and Next navigation buttons (keyboard and swipe enabled)
 * - Toggle between navigation/exploration modes
 * - Toggle metadata display
 * - Toggle fullscreen mode
 *
 * Supports keyboard arrow navigation and swipe gestures for interaction.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onClose - Handler to close the viewer.
 * @param {Function} props.onPrevious - Handler for previous navigation.
 * @param {Function} props.onNext - Handler for next navigation.
 * @param {Function} props.onToggleMetadata - Handler to toggle metadata display.
 * @param {boolean} props.isNavigationMode - Flag indicating if navigation mode is active.
 * @param {Function} props.toggleMode - Handler to toggle navigation/exploration mode.
 * @param {Function} props.onToggleFullScreen - Handler to toggle fullscreen mode.
 */
const ControlButtons = ({
  onClose,
  onPrevious,
  onNext,
  onToggleMetadata,
  isNavigationMode,
  toggleMode,
  onToggleFullScreen,
}) => {
  // State for whether the control menu is expanded/open
  const [isOpen, setIsOpen] = useState(false);

  // State to track whether the document is in fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Effect to listen for fullscreen change events and update state accordingly
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Effect to handle keyboard arrow navigation when navigation mode is active
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

  // Swipeable handlers to detect swipe gestures for previous/next navigation
  const handlers = useSwipeable({
    onSwipedLeft: () => isNavigationMode && onNext(),
    onSwipedRight: () => isNavigationMode && onPrevious(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // Toggle the action button menu open/closed
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={`${styles.fabContainer} ${
        isFullscreen ? styles.fullscreen : ""
      }`}
      style={{ zIndex: 1100 }}
      {...handlers} // Attach swipe handlers
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
                className={`${styles.fab} ${
                  isNavigationMode
                    ? styles.navigationMode
                    : styles.explorationMode
                }`}
                onClick={toggleMode}
                aria-label="Toggle Exploration Mode"
              >
                🔍 {/* Magnifying glass icon */}
              </button>
              <button
                className={styles.fab}
                onClick={onToggleMetadata}
                aria-label="Toggle Metadata"
              >
                i {/* Info icon */}
              </button>
              <button
                className={`${styles.fab} ${styles.mainFab}`}
                onClick={onClose}
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
              Explore
            </button>
          )}
        </>
      ) : (
        <button
          className={`${styles.fab} ${styles.fullscreenButton}`}
          onClick={onClose}
          aria-label="Close"
        >
          × {/* Close icon */}
        </button>
      )}
    </div>
  );
};

export default ControlButtons;
