// src/frontend/components/Viewer.js
import React, { useState } from "react";
import ControlButtons from "./ControlButtons";
import ImagePopup from "./ImagePopup";
import MetadataPopup from "./MetadataPopup";
import PanoramaViewer from "./PanoramaViewer";
import styles from "../styles/Viewer.module.css";

const Viewer = ({ item, isOpen, onClose, onNext, onPrevious }) => {
  const [showMetadata, setShowMetadata] = useState(false);

  const toggleMetadata = () => {
    setShowMetadata((prev) => !prev);
  };

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
          actualUrl={item.actualUrl}
          thumbnailUrl={item.thumbnailUrl}
          name={item.name}
        />
      );
    }
  };

  return (
    <div className={styles.viewer}>
      {renderContent()}
      <ControlButtons
        onClose={onClose}
        onNext={onNext}
        onPrevious={onPrevious}
        onToggleMetadata={toggleMetadata}
      />
      {showMetadata && (
        <MetadataPopup
          metadata={item.metadata}
          latitude={item.latitude}
          longitude={item.longitude}
          onClose={() => setShowMetadata(false)}
        />
      )}
    </div>
  );
};

export default Viewer;
