// src/components/Viewer.jsx

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import PropTypes from "prop-types";
import NavigationMedia from "./NavigationMedia";
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
  const viewerRef = useRef(null);

  useKeyboardNavigation(onClose, onPrevious, onNext);

  const toggleMetadata = useCallback(() => {
    setShowMetadata((prev) => !prev);
  }, []);

  const handleContentLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        if (showMetadata) {
          setShowMetadata(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showMetadata, onClose]);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const renderContent = useCallback(() => {
    if (item.viewer === "pano") {
      return (
        <PanoramaViewer
          panoPath={item.panoPath}
          levels={item.levels}
          initialViewParameters={item.initialViewParameters}
          onReady={handleContentLoaded}
        />
      );
    }
    return (
      <ImagePopup
        actualUrl={item.actualUrl}
        thumbnailUrl={item.thumbnailUrl}
        name={item.name}
        onLoad={handleContentLoaded}
        isNavigationMode={isNavigationMode}
      />
    );
  }, [item, isNavigationMode, handleContentLoaded]);

  return (
    <div className={styles.viewer} ref={viewerRef}>
      {isLoading && <LoadingOverlay thumbnailUrl={item.thumbnailUrl} />}
      {renderContent()}
      <NavigationMedia
        onClose={onClose}
        onNext={onNext}
        onPrevious={onPrevious}
        onToggleMetadata={toggleMetadata}
        isNavigationMode={isNavigationMode}
        toggleMode={toggleMode}
        onToggleFullScreen={toggleFullScreen}
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

Viewer.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    viewer: PropTypes.oneOf(["pano", "img"]).isRequired,
    drone: PropTypes.string,
    metadata: PropTypes.string.isRequired,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    name: PropTypes.string,
    thumbnailUrl: PropTypes.string.isRequired,
    panoPath: PropTypes.string,
    actualUrl: PropTypes.string,
    initialViewParameters: PropTypes.shape({
      yaw: PropTypes.number.isRequired,
      pitch: PropTypes.number.isRequired,
      fov: PropTypes.number.isRequired,
    }),
    levels: PropTypes.arrayOf(
      PropTypes.shape({
        tileSize: PropTypes.number.isRequired,
        size: PropTypes.number.isRequired,
        fallbackOnly: PropTypes.bool,
      })
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  isNavigationMode: PropTypes.bool.isRequired,
  toggleMode: PropTypes.func.isRequired,
};

export default memo(Viewer);
