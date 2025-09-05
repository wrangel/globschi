// src/frontend/components/LoadingErrorHandler.jsx

import PropTypes from "prop-types";
import styles from "../styles/LoadingErrorHandler.module.css";

/**
 * LoadingErrorHandler component
 * Conditionally renders loading UI, error message, or children content.
 *
 * Use as a wrapper component to manage loading and error states cleanly.
 *
 * @param {Object} props
 * @param {boolean} props.isLoading - Whether the data or content is loading.
 * @param {string} [props.error] - Optional error message to display.
 * @param {React.ReactNode} props.children - Content to render if no loading or error.
 */
const LoadingErrorHandler = ({ isLoading, error, children }) => {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={`${styles.message} ${styles.error}`}>Error: {error}</p>
      </div>
    );
  }

  return children;
};

LoadingErrorHandler.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default LoadingErrorHandler;
