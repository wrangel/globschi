// src/components/ErrorBoundary.jsx

import React from "react";
import styles from "../styles/ErrorBoundary.module.css";

/**
 * ErrorBoundary component to catch JavaScript errors in child components.
 *
 * This component catches errors during rendering, in lifecycle methods,
 * and in constructors of the entire component tree below it.
 * Instead of crashing the entire app, it displays a fallback UI.
 *
 * Usage:
 * Wrap parts of your React app in <ErrorBoundary> to catch errors locally.
 *
 * Example:
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false }; // Tracks error presence
  }

  /**
   * React lifecycle method invoked after an error has been thrown by a child component.
   * Updates state so the next render shows the fallback UI.
   *
   * @param {Error} error - The caught error
   * @returns {Object} New state with hasError set to true
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Lifecycle method for side effects after an error is caught.
   * Here you can log errors to an external reporting service.
   *
   * @param {Error} error - The caught error
   * @param {Object} errorInfo - Additional information about the error (component stack)
   */
  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  /**
   * Resets the error state to allow retrying rendering.
   */
  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI with retry button
      return (
        <div className={styles.errorBoundary}>
          <h1>Something went wrong.</h1>
          <button onClick={this.handleRetry}>Try Again</button>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
