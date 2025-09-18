// src/frontend/hooks/useLoadingError.js

import { useState, useCallback } from "react";

/**
 * Custom hook to manage loading and error states in React components.
 *
 * Provides helper functions to start and stop loading,
 * set and clear error messages, along with state values.
 *
 * @param {boolean} [initialLoadingState=true] - Optional initial loading state.
 * @returns {Object} An object containing:
 *   - isLoading: Boolean indicating if loading is in progress.
 *   - error: Current error message or null.
 *   - startLoading: Function to set loading state to true.
 *   - stopLoading: Function to set loading state to false.
 *   - setErrorMessage: Function to set an error message.
 *   - clearError: Function to clear the current error message.
 */
export const useLoadingError = (initialLoadingState = true) => {
  const [isLoading, setIsLoading] = useState(initialLoadingState);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => setIsLoading(false), []);

  const setLoading = useCallback((value) => setIsLoading(value), []);

  const setErrorMessage = useCallback((message) => {
    let normalizedMsg = null;
    if (typeof message === "string") {
      normalizedMsg = message;
    } else if (message instanceof Error) {
      normalizedMsg = message.message || "An error occurred";
    }
    setError(normalizedMsg);
    setIsLoading(false);
    setIsSuccess(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const markSuccess = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(true);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    isLoading,
    error,
    isSuccess,
    startLoading,
    stopLoading,
    setLoading,
    setErrorMessage,
    clearError,
    markSuccess,
    reset,
  };
};
