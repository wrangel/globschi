// src/components/ViewerPopup.js

import React from "react";
import ImagePopup from "./ImagePopup";
import PanoramaViewer from "./PanoramaViewer";
import FullScreenModal from "./FullScreenModal";

const ViewerPopup = ({ item, isOpen, onClose }) => {
  if (!item) return null;

  if (item.viewer === "pano") {
    return (
      <FullScreenModal isOpen={isOpen} onClose={onClose}>
        <PanoramaViewer
          imageUrl={item.actualUrl} // Assuming actualUrl is the panorama URL
          onClose={onClose}
        />
      </FullScreenModal>
    );
  } else {
    return <ImagePopup item={item} onClose={onClose} />;
  }
};

export default ViewerPopup;
