// src/frontend/components/Viewer.js
import React from "react";
import ImagePopup from "./ImagePopup";
import PanoramaViewer from "./PanoramaViewer";
import styles from "../styles/Viewer.module.css";

const Viewer = ({ item, isOpen, onClose, onNext, onPrevious }) => {
  const renderContent = () => {
    if (item.viewer === "pano") {
      return (
        <PanoramaViewer
          imageUrl={item.actualUrl}
          thumbnailUrl={item.thumbnailUrl}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );
    } else {
      return (
        <ImagePopup
          item={{ ...item, thumbnailUrl: item.thumbnailUrl }}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );
    }
  };

  return <div className={styles.viewer}>{renderContent()}</div>;
};

export default Viewer;
