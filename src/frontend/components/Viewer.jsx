// src/components/Viewer.jsx

import { useState, useEffect, useRef } from "react";
import ControlButtons from "./ControlButtons";
import ImagePopup from "./ImagePopup";
import MetadataPopup from "./MetadataPopup";
import PanoramaViewer from "./PanoramaViewer";
import LoadingOverlay from "./LoadingOverlay";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation";
import styles from "../styles/Viewer.module.css";

/**
 * Viewer component displays either an image popup or a panorama viewer,
 * along with control buttons and optional metadata popup.
 *
 * Handles fullscreen toggling, metadata display, and loading states.
 * Keyboard navigation for closing and switching images is managed by a custom hook.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.item - The item to display (image or panorama).
 * @param {Function} props.onClose - Callback to close the viewer.
 * @param {Function} props.onNext - Callback to show the next item.
 * @param {Function} props.onPrevious - Callback to show the previous item.
 * @param {boolean} props.isNavigationMode - Whether navigation mode is enabled.
 * @param {Function} props.toggleMode - Callback to toggle navigation/exploration mode.
 *
 * @returns {JSX.Element} The viewer UI.
 */
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

  // Setup keyboard shortcuts for navigation and closing
  useKeyboardNavigation(onClose, onPrevious, onNext);

  // Toggle metadata popup visibility
  const toggleMetadata = () => {
    setShowMetadata((prev) => !prev);
  };

  // Called when content finishes loading
  const handleContentLoaded = () => {
    setIsLoading(false);
  };

  // Handle Escape key for closing or hiding metadata
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

  // Toggle fullscreen mode on viewer container
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

  // Conditionally render either a panorama or an image viewer based on item type
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

export default Viewer;
