// src/frontend/components/ViewerImage.jsx

import { useState, useEffect, useRef, memo } from "react";
import panzoom from "panzoom";
import styles from "../styles/ViewerImage.module.css";

const ViewerImage = ({
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

  /* ---------- image load ---------- */
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
      setTimeout(() => setShowBleep(false), 500);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
  }, [actualUrl, onLoad]);

  /* ---------- panzoom ---------- */
  useEffect(() => {
    if (!isLoading && !hasError && imgRef.current) {
      const instance = panzoom(imgRef.current);
      panZoomInstanceRef.current = instance;
      return () => instance.dispose();
    }
  }, [isLoading, hasError]);

  useEffect(() => {
    if (panZoomInstanceRef.current) {
      isNavigationMode
        ? panZoomInstanceRef.current.resume()
        : panZoomInstanceRef.current.pause();
    }
  }, [isNavigationMode]);

  /* ---------- error fallback ---------- */
  if (hasError) {
    return (
      <div className={styles.ViewerImage} role="alert" aria-live="assertive">
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
    <div className={styles.ViewerImage}>
      {/* THUMBNAIL: always in DOM, opacity only – no layout shift */}
      <img
        src={thumbnailUrl}
        alt={`${name} thumbnail`}
        className={styles.thumbnailFullViewport}
        style={{
          opacity: isLoading ? 1 : 0,
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "contain",
          zIndex: 1040,
          transition: "opacity 0.15s ease", // faster fade
        }}
      />

      {/* MAIN IMAGE: pan-zoom container */}
      <div
        ref={imgRef}
        className={styles.panzoomContainer}
        style={{
          opacity: isLoading ? 0 : 1,
          pointerEvents: isLoading ? "none" : "auto",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 1050,
          transition: "opacity 0.15s ease",
        }}
        tabIndex={0}
        aria-label={name}
        role="img"
      >
        <img src={actualUrl} alt={name} className={styles.image} />
      </div>

      {/* bleep indicator */}
      {showBleep && (
        <button
          className={styles.bleepButton}
          aria-label="Image loaded indicator"
          type="button"
          tabIndex={-1}
          onClick={() => console.info("Bleep indicator clicked")}
        >
          ●
        </button>
      )}
    </div>
  );
};

export default memo(ViewerImage);
