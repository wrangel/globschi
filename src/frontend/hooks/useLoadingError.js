// src/frontend/hooks/useLoadingError.js

import { useState, useCallback } from "react";

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
