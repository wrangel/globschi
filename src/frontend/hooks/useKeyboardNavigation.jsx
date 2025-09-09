// src/frontend/hooks/useKeyboardNavigation.js

import { useEffect, useCallback } from "react";

/**
 * Custom hook to add keyboard navigation event listeners for Escape, ArrowLeft, and ArrowRight keys.
 *
 * Binds keydown events to these keys and calls appropriate callback functions.
 * Cleans up event listeners automatically when component unmounts or dependencies change.
 *
 * @param {Function} onClose - Callback to invoke on "Escape" key press.
 * @param {Function} onPrevious - Callback to invoke on "ArrowLeft" key press.
 * @param {Function} onNext - Callback to invoke on "ArrowRight" key press.
 */
const useKeyboardNavigation = (onClose, onPrevious, onNext) => {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape" && typeof onClose === "function") {
        onClose();
      } else if (
        event.key === "ArrowLeft" &&
        typeof onPrevious === "function"
      ) {
        event.preventDefault(); // Optional: prevent scrolling
        onPrevious();
      } else if (event.key === "ArrowRight" && typeof onNext === "function") {
        event.preventDefault(); // Optional: prevent scrolling
        onNext();
      }
    },
    [onClose, onPrevious, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardNavigation;
