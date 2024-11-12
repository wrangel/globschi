// src/hooks/useKeyboardNavigation.js
import { useEffect, useCallback } from "react";

const useKeyboardNavigation = (onClose, onPrevious, onNext) => {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose(); // Close popup when Escape is pressed
      } else if (event.key === "ArrowLeft") {
        onPrevious();
      } else if (event.key === "ArrowRight") {
        onNext();
      }
    },
    [onClose, onPrevious, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown); // Cleanup
    };
  }, [handleKeyDown]); // Now handleKeyDown is the only dependency
};

export default useKeyboardNavigation;
