// src/frontend/components/Viewer.js

import React, { useState, useEffect } from "react";
import ControlButtons from "./ControlButtons";
import ImagePopup from "./ImagePopup";
import MetadataPopup from "./MetadataPopup";
import PanoramaViewer from "./PanoramaViewer";
import LoadingOverlay from "./LoadingOverlay";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation";
import styles from "../styles/Viewer.module.css";

const Viewer = ({
  item,
  onClose,
  onNext,
  onPrevious,
  isNavigationMode,
  toggleMode,
}) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle keyboard navigation
  useKeyboardNavigation(onClose, onPrevious, onNext);

  const toggleMetadata = () => {
    setShowMetadata((prev) => !prev);
  };

  const handleContentLoaded = () => {
    setIsLoading(false);
  };

  // Handle Esc key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (showMetadata) {
          // Close metadata popup if it's open
          setShowMetadata(false);
        } else {
          // Close the main viewer if metadata is not open
          onClose();
        }
      }
    };

    // Add event listener for keydown
    document.addEventListener("keydown", handleEscKey);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showMetadata, onClose]); // Dependency array includes showMetadata and onClose

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

  const isPano = item.viewer === "pano";

  return (
    <div className={styles.viewer}>
      {isLoading && <LoadingOverlay thumbnailUrl={item.thumbnailUrl} />}
      {renderContent()}
      <ControlButtons
        onClose={onClose}
        onNext={onNext}
        onPrevious={onPrevious}
        onToggleMetadata={toggleMetadata}
        isNavigationMode={isNavigationMode} // Pass the navigation mode state
        toggleMode={toggleMode} // Pass the toggle function
        isPano={isPano} // Pass the isPano state
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
