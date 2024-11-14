// src/frontend/components/ViewerPopup.js
import React, { useEffect } from "react";
import Viewer from "./Viewer";
import FullScreenModal from "./FullScreenModal";

const ViewerPopup = ({ item, isOpen, onClose, onNext, onPrevious }) => {
  if (!item) return null;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose(); // Close modal when Escape key is pressed
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

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
