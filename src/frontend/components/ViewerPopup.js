import React, { useEffect } from "react";
import FullScreenModal from "./FullScreenModal";
import Viewer from "./Viewer";

const ViewerPopup = ({ item, isOpen, onClose, onNext, onPrevious }) => {
  // Handle keyboard navigation using useEffect
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose(); // Close modal when Escape key is pressed
      }
    };

    // Only add event listener if isOpen is true
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!item) return null;

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose}>
      <Viewer
        item={item}
        isOpen={isOpen}
        onClose={onClose}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </FullScreenModal>
  );
};

export default React.memo(ViewerPopup);
