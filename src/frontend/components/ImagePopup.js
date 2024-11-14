// src/frontend/components/ImagePopup.js
import React, { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import ControlButtons from "./ControlButtons";
import styles from "../styles/ImagePopup.module.css";

const ImagePopup = ({ item, onClose, onNext, onPrevious }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = item.actualUrl;
    img.onload = () => setIsLoading(false);
  }, [item.actualUrl]);

  return (
    <div className={styles.imagePopup}>
      {isLoading && <LoadingOverlay thumbnailUrl={item.thumbnailUrl} />}
      <img
        src={item.actualUrl}
        alt={item.name}
        className={`${styles.image} ${isLoading ? styles.hidden : ""}`}
      />
      <ControlButtons
        onClose={onClose}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
};

export default ImagePopup;
