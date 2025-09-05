// src/frontend/components/LoadingOverlay.jsx

import PropTypes from "prop-types";
import styles from "../styles/LoadingOverlay.module.css";

/**
 * LoadingOverlay component
 *
 * Displays a fullscreen overlay with a spinner and optional thumbnail image.
 *
 * Props:
 * - thumbnailUrl (optional): URL of a thumbnail image to show while loading.
 *
 * @param {Object} props
 * @param {string} [props.thumbnailUrl] Optional thumbnail image URL.
 * @returns {JSX.Element} Loading overlay element.
 */
function LoadingOverlay({ thumbnailUrl }) {
  return (
    <div className={styles.loadingOverlay} aria-live="polite" aria-busy="true">
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt="Loading preview thumbnail"
          className={styles.thumbnail}
          aria-hidden="true"
          loading="lazy"
        />
      )}
      <div className={styles.spinner} aria-label="Loading spinner"></div>
    </div>
  );
}

LoadingOverlay.propTypes = {
  thumbnailUrl: PropTypes.string,
};

export default LoadingOverlay;
