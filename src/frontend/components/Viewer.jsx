// src/components/Viewer.jsx

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
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
  const viewerRef = useRef(null);

  useKeyboardNavigation(onClose, onPrevious, onNext);

  const toggleMetadata = () => {
    setShowMetadata((prev) => !prev);
  };

  const handleContentLoaded = () => {
    setIsLoading(false);
  };

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

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  const renderContent = () => {
    if (item.viewer === "pano") {
      return (
        <PanoramaViewer
          panoPath={item.panoPath}
          initialViewParameters={item.initialViewParameters}
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
          isNavigationMode={isNavigationMode}
        />
      );
    }
  };

  return (
    <div className={styles.viewer} ref={viewerRef}>
      {isLoading && <LoadingOverlay thumbnailUrl={item.thumbnailUrl} />}
      {renderContent()}
      <ControlButtons
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
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  isNavigationMode: PropTypes.bool.isRequired,
  toggleMode: PropTypes.func.isRequired,
};

export default Viewer;
