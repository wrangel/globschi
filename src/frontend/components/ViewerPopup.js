// src/frontend/components/ViewerPopup.js
import React from "react";
import Viewer from "./Viewer";
import FullScreenModal from "./FullScreenModal";

const ViewerPopup = ({ item, isOpen, onClose, onNext, onPrevious }) => {
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
