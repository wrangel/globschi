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

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  const setErrorMessage = useCallback((message) => setError(message), []);
  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setErrorMessage,
    clearError,
  };
};
