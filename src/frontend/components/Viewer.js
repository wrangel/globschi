// src/frontend/components/Viewer.js
import React, { useState } from "react";
import ControlButtons from "./ControlButtons";
import ImagePopup from "./ImagePopup";
import MetadataPopup from "./MetadataPopup";
import PanoramaViewer from "./PanoramaViewer";
import LoadingOverlay from "./LoadingOverlay";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation";
import styles from "../styles/Viewer.module.css";

const Viewer = ({ item, onClose, onNext, onPrevious }) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useKeyboardNavigation(onClose, onPrevious, onNext);

  const toggleMetadata = () => {
    setShowMetadata((prev) => !prev);
  };

  const handleContentLoaded = () => {
    setIsLoading(false);
  };

  const renderContent = () => {
    if (item.viewer === "pano") {
      return (
        <PanoramaViewer
          imageUrl={item.actualUrl}
          thumbnailUrl={item.thumbnailUrl}
          onReady={handleContentLoaded}
        />
      );
    } else {
      return (
        <ImagePopup
          actualUrl={item.actualUrl}
          thumbnailUrl={item.thumbnailUrl}
          name={item.name}
          onLoad={handleContentLoaded}
        />
      );
    }
  };

  return (
    <div className={styles.viewer}>
      {isLoading && <LoadingOverlay thumbnailUrl={item.thumbnailUrl} />}
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
