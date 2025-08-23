// src/frontend/components/LoadingErrorHandler.jsx

import PropTypes from "prop-types";
import styles from "../styles/LoadingErrorHandler.module.css";

/**
 * LoadingErrorHandler component renders either a loading indicator,
 * an error message, or its children content based on the current state.
 *
 * Useful for managing loading and error states in UI while fetching data.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.isLoading - Whether data is currently loading.
 * @param {string} [props.error] - Optional error message to display.
 * @param {React.ReactNode} props.children - The child components to render when not loading or error.
 *
 * @returns {React.ReactElement} The loading UI, error UI, or children content.
 */
const LoadingErrorHandler = ({ isLoading, error, children }) => {
  if (isLoading) {
    // Show loading message or spinner while loading
    return (
      <div className={styles.container}>
        <p className={styles.message}>Loading...</p>
      </div>
    );
  }

  if (error) {
    // Show error message if present
    return (
      <div className={styles.container}>
        <p className={`${styles.message} ${styles.error}`}>Error: {error}</p>
      </div>
    );
  }

  // If no loading or error, render children content normally
  return children;
};

LoadingErrorHandler.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default LoadingErrorHandler;
