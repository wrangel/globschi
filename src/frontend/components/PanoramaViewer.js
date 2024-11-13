// src/components/PanoramaViewer.js
import React, { useState } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import LoadingOverlay from "./LoadingOverlay";
import styles from "../styles/PanoramaViewer.module.css";

const PanoramaViewer = ({ imageUrl, thumbnailUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleReady = () => {
    setIsLoading(false);
  };

  return (
    <div className={styles.panoramaViewer}>
      {isLoading && <LoadingOverlay thumbnailUrl={thumbnailUrl} />}
      <ReactPhotoSphereViewer
        src={imageUrl}
        height="100vh"
        width="100%"
        onReady={handleReady}
        // Other props...
      />
    </div>
  );
};

export default PanoramaViewer;
