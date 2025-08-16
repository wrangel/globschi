// src/components/PanoramaViewer.jsx

import { useState } from "react";
import Pannellum from "react-pannellum";
import styles from "../styles/PanoramaViewer.module.css";

const PanoramaViewer = ({
  imageUrl,
  thumbnailUrl,
  isNavigationMode,
  onLoad,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("safari") > -1 && ua.indexOf("chrome") === -1;
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    console.error("Panorama failed to load.");
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  if (isSafari()) {
    return (
      <div className={styles.errorOverlay}>
        <div className={styles.errorMessage}>
          <h1>Safari Does Not Support This Feature.</h1>
          <p>Please try using a different browser like Chrome or Firefox.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panoramaViewer}>
      {/* Remove manual thumbnail rendering - let pannellum handle preview */}
      <Pannellum
        id="panoramaViewer"
        sceneId="scene1"
        width="100vw"
        height="100vh"
        image={imageUrl}
        previewImage={thumbnailUrl} // Pass your thumbnail here
        pitch={0}
        yaw={0}
        hfov={110}
        autoLoad={true} // <-- load immediately without click
        autoRotate={!isNavigationMode}
        onLoad={handleLoad}
        onLoadError={handleError}
        showControls={!isNavigationMode}
        compass={false}
        keyboardZoom={false}
        mouseZoom={false}
        draggable={!isNavigationMode}
        hotspotDebug={false}
      />
    </div>
  );
};

export default PanoramaViewer;
