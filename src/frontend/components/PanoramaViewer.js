// src/components/PanoramaViewer.js
import React, { useState } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import ControlButtons from "./ControlButtons";
import styles from "../styles/PanoramaViewer.module.css";

const PanoramaViewer = ({
  imageUrl,
  thumbnailUrl,
  onClose,
  onNext,
  onPrevious,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleReady = () => {
    setIsLoading(false);
  };

  return (
    <div className={styles.panoramaViewer}>
      <ReactPhotoSphereViewer
        src={imageUrl}
        height="100vh"
        width="100%"
        onReady={handleReady}
        navbar={false}
        loadingTxt="" // Set this to an empty string to remove the "Loading..." text
      />
      <ControlButtons
        onClose={onClose}
        onPrevious={onPrevious}
        onNext={onNext}
      />
      {isLoading && thumbnailUrl && (
        <img src={thumbnailUrl} alt="Thumbnail" className={styles.thumbnail} />
      )}
    </div>
  );
};

export default PanoramaViewer;
