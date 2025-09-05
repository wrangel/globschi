// src/frontend/components/NavigationMedia.jsx

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "../styles/Navigation.module.css";

/**
 * Viewer Controls Floating Action Button (NavigationMedia).
 *
 * Shows navigation arrows (Prev/Next) when in navigation mode and not fullscreen,
 * buttons for fullscreen toggle, metadata toggle, and close actions.
 * Shows a simple close button when in fullscreen.
 *
 * @param {Object} props
 * @param {() => void} props.onClose Callback to close viewer.
 * @param {() => void} props.onPrevious Navigate to previous item.
 * @param {() => void} props.onNext Navigate to next item.
 * @param {() => void} props.onToggleMetadata Toggle metadata panel.
 * @param {boolean} props.isNavigationMode True if navigation arrows should show.
 * @param {() => void} props.onToggleFullScreen Toggle fullscreen mode.
 */
function NavigationMedia({
  onClose,
  onPrevious,
  onNext,
  onToggleMetadata,
  isNavigationMode,
  onToggleFullScreen,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div
      className={`${styles.fabContainer} ${
        isFullscreen ? styles.fullscreen : ""
      }`}
      style={{ zIndex: 1100 }}
    >
      {/* Navigation arrows shown only when navigation mode active and not fullscreen */}
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

      {/* Main FAB controls when not fullscreen */}
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

          <button className={styles.fab} onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
      )}

      {/* Fullscreen mode shows only close button */}
      {isFullscreen && (
        <button className={styles.fab} onClick={onClose} aria-label="Close">
          Close
        </button>
      )}
    </div>
  );
}

NavigationMedia.propTypes = {
  onClose: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onToggleMeta: PropTypes.func.isRequired,
  isNavigationMode: PropTypes.bool.isRequired,
  onToggleFullScreen: PropTypes.func.isRequired,
};

export default NavigationMedia;
