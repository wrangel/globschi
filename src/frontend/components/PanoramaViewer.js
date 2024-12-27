// src/components/PanoramaViewer.js

import React, { useState, useEffect } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import styles from "../styles/PanoramaViewer.module.css";

const PanoramaViewer = ({ imageUrl, thumbnailUrl, isNavigationMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewer, setViewer] = useState(null);

  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("safari") > -1 && ua.indexOf("chrome") === -1;
  };

  const handleReady = (instance) => {
    setIsLoading(false);
    setViewer(instance);
    if (!isNavigationMode) {
      instance.getPlugin(AutorotatePlugin).start();
    }
  };

  useEffect(() => {
    if (viewer) {
      const autorotatePlugin = viewer.getPlugin(AutorotatePlugin);
      if (isNavigationMode) {
        autorotatePlugin.stop();
      } else {
        autorotatePlugin.start();
      }
    }
  }, [isNavigationMode, viewer]);

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
      <ReactPhotoSphereViewer
        src={imageUrl}
        height="100vh"
        width="100%"
        onReady={handleReady}
        plugins={[AutorotatePlugin]}
        navbar={false}
      />
      {isLoading && thumbnailUrl && (
        <img src={thumbnailUrl} alt="Thumbnail" className={styles.thumbnail} />
      )}
    </div>
  );
};

export default PanoramaViewer;
