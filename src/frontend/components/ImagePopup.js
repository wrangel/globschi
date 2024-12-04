// src/frontend/components/ImagePopup.js

import React, { useState, useEffect } from "react";
import LoadingOverlay from "./LoadingOverlay";
import styles from "../styles/ImagePopup.module.css";

const ImagePopup = ({ actualUrl, thumbnailUrl, name }) => {
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className={`${styles.imagePopup} ${!isLoading ? styles.loaded : ""}`}>
      {isLoading && <LoadingOverlay thumbnailUrl={thumbnailUrl} />}
      <img
        src={actualUrl}
        alt={name}
        className={`${styles.image} ${isLoading ? styles.hidden : ""}`}
      />
    </div>
  );
};

export default ImagePopup;
