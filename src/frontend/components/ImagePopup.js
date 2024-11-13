// src/components/ImagePopup.js
import React, { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import styles from "../styles/ImagePopup.module.css";

const ImagePopup = ({ item, onClose }) => {
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
      {/* Other controls and content */}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ImagePopup;
