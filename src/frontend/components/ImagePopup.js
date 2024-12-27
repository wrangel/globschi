// src/frontend/components/ImagePopup.js

import React, { useState, useEffect, useRef } from "react";
import LoadingOverlay from "./LoadingOverlay";
import panzoom from "panzoom";
import styles from "../styles/ImagePopup.module.css";

const ImagePopup = ({ actualUrl, thumbnailUrl, name, isNavigationMode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);
  const panZoomInstanceRef = useRef(null);

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

    return () => {
      document.body.classList.remove("hide-scrollbar");
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && imgRef.current) {
      const instance = panzoom(imgRef.current);
      panZoomInstanceRef.current = instance;
      return () => {
        instance.dispose(); // Clean up panzoom instance
      };
    }
  }, [isLoading]);

  useEffect(() => {
    if (panZoomInstanceRef.current) {
      if (isNavigationMode) {
        panZoomInstanceRef.current.resume();
      } else {
        panZoomInstanceRef.current.pause();
      }
    }
  }, [isNavigationMode]);

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
