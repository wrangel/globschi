import { useState, useEffect, useRef, useCallback, memo } from "react";
import PropTypes from "prop-types";
import NavigationMedia from "./NavigationMedia";
import ViewerImage from "./ViewerImage";
import PopupMetadata from "./PopupMetadata";
import ViewerPanorama from "./ViewerPanorama";
import LoadingOverlay from "./LoadingOverlay";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation";
import styles from "../styles/Viewer.module.css";

// 1. Create a memoized component to handle the conditional rendering
const MediaContent = memo(({ item, isNavigationMode, onContentLoaded }) => {
  if (item.viewer === "pano") {
    return (
      <ViewerPanorama
        panoPath={item.panoPath}
        levels={item.levels}
        initialViewParameters={item.initialViewParameters}
        onReady={onContentLoaded}
        onError={(err) => console.error("Panorama error:", err)}
      />
    );
  }
  return (
    <ViewerImage
      actualUrl={item.actualUrl}
      thumbnailUrl={item.thumbnailUrl}
      name={item.name}
      onLoad={onContentLoaded}
      isNavigationMode={isNavigationMode}
    />
  );
});

MediaContent.propTypes = {
  item: PropTypes.shape({
    viewer: PropTypes.oneOf(["pano", "img"]).isRequired,
    panoPath: PropTypes.string,
    actualUrl: PropTypes.string,
    levels: PropTypes.array,
    initialViewParameters: PropTypes.object,
    thumbnailUrl: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  isNavigationMode: PropTypes.bool.isRequired,
  onContentLoaded: PropTypes.func.isRequired,
};

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

  return (
    <div
      className={styles.viewer}
      ref={viewerRef}
      role="region"
      aria-label={`Media viewer for ${item.name || "item"}`}
      tabIndex={-1}
    >
      {isLoading && <LoadingOverlay thumbnailUrl={item.thumbnailUrl} />}

      <MediaContent
        item={item}
        isNavigationMode={isNavigationMode}
        onContentLoaded={handleContentLoaded}
      />

      <NavigationMedia
        onClose={onClose}
        onNext={onNext}
        onPrevious={onPrevious}
        onToggleMetadata={toggleMetadata}
        isNavigationMode={isNavigationMode}
        toggleMode={toggleMode}
        onToggleFullScreen={toggleFullScreen}
        isFirst={item.isFirst}
        isLast={item.isLast}
      />

      <PopupMetadata
        metadata={item.metadata}
        latitude={item.latitude}
        longitude={item.longitude}
        onClose={() => setShowMetadata(false)}
        isVisible={showMetadata}
      />
    </div>
  );
};

Viewer.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    viewer: PropTypes.oneOf(["pano", "img"]).isRequired,
    panoPath: PropTypes.string,
    actualUrl: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    name: PropTypes.string,
    levels: PropTypes.array,
    initialViewParameters: PropTypes.shape({
      yaw: PropTypes.number,
      pitch: PropTypes.number,
      fov: PropTypes.number,
    }),
    metadata: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    isFirst: PropTypes.bool,
    isLast: PropTypes.bool,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
  isNavigationMode: PropTypes.bool.isRequired,
  toggleMode: PropTypes.func.isRequired,
};

export default memo(Viewer);
