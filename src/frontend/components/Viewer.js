// src/frontend/components/Viewer.js
import React, { useState, useCallback } from "react";
import ImagePopup from "./ImagePopup";
import PanoramaViewer from "./PanoramaViewer";
import LoadingOverlay from "./LoadingOverlay";
import ControlButtons from "./ControlButtons";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation";
import styles from "../styles/Viewer.module.css";

const Viewer = ({ item, isOpen, onClose, onNext, onPrevious }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showMetadata, setShowMetadata] = useState(false);

  useKeyboardNavigation(onClose, onPrevious, onNext);

  const handleImageLoad = useCallback(() => setIsLoading(false), []);

  const toggleMetadata = useCallback(
    () => setShowMetadata((prev) => !prev),
    []
  );

  const renderContent = () => {
    if (item.viewer === "pano") {
      return (
        <PanoramaViewer imageUrl={item.actualUrl} onLoad={handleImageLoad} />
      );
    } else {
      return <ImagePopup item={item} onLoad={handleImageLoad} />;
    }
  };

  return (
    <div className={styles.viewer}>
      {isLoading && <LoadingOverlay thumbnailUrl={item.thumbnailUrl} />}
      {renderContent()}
      <ControlButtons
        onClose={onClose}
        onPrevious={onPrevious}
        onNext={onNext}
        onToggleMetadata={toggleMetadata}
      />
      {showMetadata && (
        <div className={styles.metadataPopup}>
          <pre>{item.metadata}</pre>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}&maptype=satellite`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapLink}
          >
            View on Map
          </a>
        </div>
      )}
    </div>
  );
};

export default React.memo(Viewer);
