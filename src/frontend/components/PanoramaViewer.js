// src/components/PanoramaViewer.js

import React, { useState } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import styles from "../styles/PanoramaViewer.module.css";

const PanoramaViewer = ({ imageUrl, thumbnailUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Function to detect if the browser is Safari
  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("safari") > -1 && ua.indexOf("chrome") === -1;
  };

  const handleReady = () => {
    setIsLoading(false);
  };

  // Check if the browser is Safari and display a message
  if (isSafari()) {
    return (
      <div className={styles.errorOverlay}>
        <div className={styles.errorMessage}>
          <h1>Safari Does Not Support This Feature</h1>
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
        navbar={false} // Disable navbar if not needed
      />
      {isLoading && thumbnailUrl && (
        <img src={thumbnailUrl} alt="Thumbnail" className={styles.thumbnail} />
      )}
    </div>
  );
};

export default PanoramaViewer;
