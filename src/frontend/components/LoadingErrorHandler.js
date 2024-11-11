// src/frontend/components/LoadingErrorHandler.js

import React from "react";
import PropTypes from "prop-types";

const LoadingErrorHandler = ({ isLoading, error, children }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return children;
};

LoadingErrorHandler.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default LoadingErrorHandler;
