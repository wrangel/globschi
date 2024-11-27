// src/components/ErrorBoundary.js

import React from "react";
import * as Sentry from "@sentry/react";
import initSentry from "./SentryInit";
import styles from "../styles/ErrorBoundary.module.css";

// Initialize Sentry when the component mounts
initSentry();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to Sentry with additional context
    Sentry.captureException(error, { extra: errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false }); // Reset the error state
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI with a retry button
      return (
        <div className={styles.errorBoundary}>
          <h1>Something went wrong.</h1>
          <button onClick={this.handleRetry}>Try Again</button>
        </div>
      );
    }

    return this.props.children; // Render children if no error
  }
}

export default ErrorBoundary;
