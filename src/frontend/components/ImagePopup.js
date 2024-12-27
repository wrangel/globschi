// src/frontend/components/ImagePopup.js

import React, { useState, useEffect, useRef } from "react";
import LoadingOverlay from "./LoadingOverlay";
import panzoom from "panzoom";
import styles from "../styles/ImagePopup.module.css";

const ImagePopup = ({ actualUrl, thumbnailUrl, name }) => {
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = actualUrl;
    img.onload = () => setIsLoading(false);
  }, [actualUrl]);

  useEffect(() => {
    if (!isLoading) {
      document.body.classList.add("hide-scrollbar");
    } else {
      document.body.classList.remove("hide-scrollbar");
    }

    // Cleanup when the component is unmounted
    return () => {
      document.body.classList.remove("hide-scrollbar");
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && imgRef.current) {
      const panZoomInstance = panzoom(imgRef.current);
      return () => {
        panZoomInstance.dispose(); // Clean up panzoom instance
      };
    }
  }, [isLoading]);

  return (
    <div className={`${styles.imagePopup} ${!isLoading ? styles.loaded : ""}`}>
      {isLoading && <LoadingOverlay thumbnailUrl={thumbnailUrl} />}
      <div ref={imgRef} className={styles.panzoomContainer}>
        <img
          src={actualUrl}
          alt={name}
          className={`${styles.image} ${isLoading ? styles.hidden : ""}`}
        />
      </div>
    </div>
  );
};

export default ImagePopup;
