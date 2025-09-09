// src/frontend/components/ImagePopup.jsx

import { useState, useEffect, useRef } from "react";
import panzoom from "panzoom";
import styles from "../styles/ImagePopup.module.css";

const ImagePopup = ({
  actualUrl,
  thumbnailUrl,
  name,
  isNavigationMode,
  onLoad,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showBleep, setShowBleep] = useState(false);
  const imgRef = useRef(null);
  const panZoomInstanceRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    setShowBleep(false);

    const img = new Image();
    img.src = actualUrl;
    img.onload = () => {
      setIsLoading(false);
      setShowBleep(true);
      if (onLoad) onLoad();

      // Hide the bleep button after 1 second
      setTimeout(() => setShowBleep(false), 500);
    };
  }, [actualUrl, onLoad]);

  useEffect(() => {
    if (!isLoading && imgRef.current) {
      const instance = panzoom(imgRef.current);
      panZoomInstanceRef.current = instance;

      return () => {
        instance.dispose();
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
    <div className={styles.imagePopup}>
      {isLoading && (
        <img
          src={thumbnailUrl}
          alt={`${name} thumbnail`}
          className={styles.thumbnailFullViewport}
        />
      )}
      <div
        ref={imgRef}
        className={`${styles.panzoomContainer} ${
          isLoading ? styles.hidden : ""
        }`}
      >
        <img src={actualUrl} alt={name} className={styles.image} />
      </div>

      {/* Show the bleep indicator button for 1 second after load */}
      {showBleep && (
        <button
          className={styles.bleepButton}
          aria-label="Image loaded indicator"
          type="button"
          tabIndex={-1} // not focusable by tab
          onClick={() => {
            // Optional: could trigger a sound, animation, or console log
            console.info("Bleep indicator clicked");
          }}
        >
          ●
        </button>
      )}
    </div>
  );
};

export default ImagePopup;
