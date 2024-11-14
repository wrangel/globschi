// src/frontend/components/Viewer.js
import React, { useState } from "react";
import ImagePopup from "./ImagePopup";
import PanoramaViewer from "./PanoramaViewer";
import ControlButtons from "./ControlButtons";
import MetadataPopup from "./MetadataPopup"; // Import the new component
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

  return (
    <div className={styles.viewer}>
      {renderContent()}
      <ControlButtons
        onClose={onClose}
        onNext={onNext}
        onPrevious={onPrevious}
        onToggleMetadata={toggleMetadata} // Pass toggle function
      />
      {showMetadata && (
        <MetadataPopup
          metadata={item.metadata}
          onClose={() => setShowMetadata(false)}
        />
      )}
    </div>
  );
};

export default Viewer;
