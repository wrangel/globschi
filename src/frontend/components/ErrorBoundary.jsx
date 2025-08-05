// src/components/ErrorBoundary.jsx

import React from "react";
import styles from "../styles/ErrorBoundary.module.css";

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
