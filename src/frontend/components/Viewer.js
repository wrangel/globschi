// src/components/Viewer.js
import React from "react";
import ImagePopup from "./ImagePopup";
import PanoramaViewer from "./PanoramaViewer";

const Viewer = ({ item, isOpen, onClose }) => {
  const renderContent = () => {
    if (item.viewer === "pano") {
      return (
        <PanoramaViewer
          imageUrl={item.actualUrl}
          thumbnailUrl={item.thumbnailUrl}
        />
      );
    } else {
      return (
        <ImagePopup
          item={{ ...item, thumbnailUrl: item.thumbnailUrl }}
          onClose={onClose}
        />
      );
    }
  };

  return <div>{renderContent()}</div>;
};

export default Viewer;
