// src/frontend/components/ImagePopup.jsx

import { useState, useEffect, useRef } from "react";
import panzoom from "panzoom";
import styles from "../styles/ImagePopup.module.css";

/**
 * ImagePopup component with robust error handling and accessibility.
 */
const ImagePopup = ({
  actualUrl,
  thumbnailUrl,
  name,
  isNavigationMode,
  onLoad,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showBleep, setShowBleep] = useState(false);
  const imgRef = useRef(null);
  const panZoomInstanceRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
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
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
  }, [actualUrl, onLoad]);

  useEffect(() => {
    if (!isLoading && !hasError && imgRef.current) {
      const instance = panzoom(imgRef.current);
      panZoomInstanceRef.current = instance;

      return () => {
        instance.dispose();
      };
    }
  }, [isLoading, hasError]);

  useEffect(() => {
    if (panZoomInstanceRef.current) {
      if (isNavigationMode) {
        panZoomInstanceRef.current.resume();
      } else {
        panZoomInstanceRef.current.pause();
      }
    }
  }, [isNavigationMode]);

  if (hasError) {
    return (
      <div className={styles.imagePopup} role="alert" aria-live="assertive">
        <p>Failed to load image: {name}</p>
        <img
          src={thumbnailUrl}
          alt={`${name} thumbnail fallback`}
          className={styles.thumbnailFullViewport}
        />
      </div>
    );
  }

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
        tabIndex={0} // make container focusable for keyboard users
        aria-label={name}
        role="img"
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
