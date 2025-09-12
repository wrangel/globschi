// src/frontend/components/ErrorBoundary.jsx

import React from "react";
import LoadingErrorHandler from "./LoadingErrorHandler";

/**
 * ErrorBoundary component to catch JavaScript errors in child components
 * and display a consistent error UI using LoadingErrorHandler.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to display fallback UI
    return {
      hasError: true,
      errorMessage: error.message || "An error occurred.",
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for monitoring
    console.error("Uncaught error:", error, errorInfo);
    // Optionally call an external logging service here
  }

  handleRetry = () => {
    // Reset error state to attempt re-render of children
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      // Render LoadingErrorHandler with error styling and retry button
      return (
        <LoadingErrorHandler isLoading={false} error={this.state.errorMessage}>
          {/* Provide a retry button to reset the error */}
          <button
            onClick={this.handleRetry}
            aria-label="Retry"
            type="button"
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </LoadingErrorHandler>
      );
    }

    // Render normally if no error
    return this.props.children;
  }
}

export default ErrorBoundary;
