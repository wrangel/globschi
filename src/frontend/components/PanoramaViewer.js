// src/components/PanoramaViewer.js

import React, { useState } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import styles from "../styles/PanoramaViewer.module.css";

const PanoramaViewer = ({ imageUrl, thumbnailUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [setError] = useState(null);

  // Function to detect non-Chromium browsers
  const isNonChromiumBrowser = () => {
    const ua = navigator.userAgent.toLowerCase();

    // Check for Chromium-based browsers (Chrome, Edge, Brave, etc.)
    const isChromium =
      ua.includes("chrome") || ua.includes("chromium") || ua.includes("edg");

    // Return true if the browser is not Chromium-based
    return !isChromium;
  };

  const handleReady = () => {
    setIsLoading(false);
  };

  const handleError = (err) => {
    setError(err.toString());
    setIsLoading(false);
  };

  // Check if the browser is non-Chromium and display a message
  if (isNonChromiumBrowser()) {
    return (
      <div className={styles.errorOverlay}>
        <div className={styles.errorMessage}>
          <h1>Your Browser Does Not Support The Panorama Viewer</h1>
          <p>
            This feature is not supported in your current browser. Please try
            using a Chromium-based browser like Chrome, Edge, or Brave.
          </p>
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
        onError={handleError}
        navbar={false} // Disable navbar if not needed
      />
      {isLoading && thumbnailUrl && (
        <img src={thumbnailUrl} alt="Thumbnail" className={styles.thumbnail} />
      )}
    </div>
  );
};

export default PanoramaViewer;
