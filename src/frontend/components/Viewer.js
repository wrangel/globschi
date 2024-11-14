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
          latitude={item.latitude} // Pass latitude
          longitude={item.longitude} // Pass longitude
          onClose={() => setShowMetadata(false)}
        />
      )}
    </div>
  );
};

export default Viewer;
