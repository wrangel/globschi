// src/components/PanoramaViewer.js

import React, { useState } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import styles from "../styles/PanoramaViewer.module.css";

const PanoramaViewer = ({ imageUrl, thumbnailUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleReady = () => {
    setIsLoading(false);
  };

  const handleError = (err) => {
    setError(err.toString());
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className={styles.errorOverlay}>
        <div className={styles.errorMessage}>
          <h1>Error Loading Panorama</h1>
          <p>{error}</p>
          <button onClick={onClose}>Close</button>
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
        navbar={false}
      />
      {isLoading && thumbnailUrl && (
        <img src={thumbnailUrl} alt="Thumbnail" className={styles.thumbnail} />
      )}
    </div>
  );
};

export default PanoramaViewer;
