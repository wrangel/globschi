// src/hooks/useKeyboardNavigation.js
import { useEffect } from "react";

const useKeyboardNavigation = (onClose, onPrevious, onNext) => {
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose(); // Close popup when Escape is pressed
    } else if (event.key === "ArrowLeft") {
      onPrevious();
    } else if (event.key === "ArrowRight") {
      onNext();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown); // Cleanup
    };
  }, [onClose, onPrevious, onNext]);
};

export default useKeyboardNavigation;
