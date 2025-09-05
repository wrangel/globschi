// src/frontend/components/ErrorBoundary.jsx

import React from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/ErrorBoundary.module.css";

// Lightweight frontend logger (same format as backend)
const logError = async (error, errorInfo) => {
  try {
    const { default: logger } = await import("../../backend/utils/logger.mjs");
    logger.error("[ErrorBoundary]", {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      href: window.location.href,
      userAgent: navigator.userAgent,
      commit: process.env.REACT_APP_GIT_SHA || "unknown",
    });
  } catch {
    // logger not available – ignore
  }
};

/**
 * @typedef {{children: React.ReactNode, onError?: (e: Error, info: any) => void}} Props
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
    if (typeof window.reportError === "function") {
      window.reportError(error, errorInfo);
    }
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // Auto-reset on route change (React-Router v6)
    const location = this.props.location || {};
    const prevLocation = prevProps.location || {};
    if (location.pathname !== prevLocation.pathname && this.state.hasError) {
      this.resetError();
    }
  }

  resetError() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      const showDetails = process.env.NODE_ENV !== "production";
      return (
        <div className={styles.errorBoundary}>
          <h1>Something went wrong.</h1>
          {showDetails && (
            <pre className={styles.errorDetails}>
              {this.state.error?.toString()}
            </pre>
          )}
          <button onClick={this.resetError}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrapper that supplies location (works with React-Router v6)
export default function ErrorBoundaryWrapper(props) {
  const location = useLocation();
  return <ErrorBoundary {...props} location={location} />;
}
