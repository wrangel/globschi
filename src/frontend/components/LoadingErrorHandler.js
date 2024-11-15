// src/frontend/components/LoadingErrorHandler.js

import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/LoadingErrorHandler.module.css";

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
