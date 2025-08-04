// src/frontend/hooks/useKeyboardNavigation.js

import { useEffect, useCallback } from "react";

const useKeyboardNavigation = (onClose, onPrevious, onNext) => {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape" && typeof onClose === "function") {
        onClose();
      } else if (
        event.key === "ArrowLeft" &&
        typeof onPrevious === "function"
      ) {
        onPrevious();
      } else if (event.key === "ArrowRight" && typeof onNext === "function") {
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
