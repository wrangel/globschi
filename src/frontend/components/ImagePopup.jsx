// src/frontend/components/ImagePopup.jsx

import { useState, useEffect, useRef } from "react";
import LoadingOverlay from "./LoadingOverlay";
import panzoom from "panzoom";
import styles from "../styles/ImagePopup.module.css";

/**
 * ImagePopup component displays an image with zoom and pan capabilities.
 *
 * It shows a loading overlay while the high-resolution image is loading,
 * disables page scrolling while the image is displayed,
 * and allows toggling pan/zoom navigation based on mode.
 *
 * @param {Object} props - Component props.
 * @param {string} props.actualUrl - URL of the main high-resolution image.
 * @param {string} props.thumbnailUrl - URL of the loading thumbnail image.
 * @param {string} props.name - Alt text / name of the image.
 * @param {boolean} props.isNavigationMode - Whether pan/zoom navigation is enabled.
 */
const ImagePopup = ({ actualUrl, thumbnailUrl, name, isNavigationMode }) => {
  const [isLoading, setIsLoading] = useState(true); // Loading state for high-res image
  const imgRef = useRef(null); // Ref to image container DOM element
  const panZoomInstanceRef = useRef(null); // Stores panzoom instance for control

  // Pre-load high-resolution image, update loading state when done
  useEffect(() => {
    const img = new Image();
    img.src = actualUrl;
    img.onload = () => setIsLoading(false);
  }, [actualUrl]);

  // Manage page scrollbar visibility while image is loading
  useEffect(() => {
    if (!isLoading) {
      document.body.classList.add("hide-scrollbar");
    } else {
      document.body.classList.remove("hide-scrollbar");
    }

    // Cleanup on unmount or URL change
    return () => {
      document.body.classList.remove("hide-scrollbar");
    };
  }, [isLoading]);

  // Initialize panzoom on the image container once loading completes
  useEffect(() => {
    if (!isLoading && imgRef.current) {
      const instance = panzoom(imgRef.current);
      panZoomInstanceRef.current = instance;

      // Cleanup panzoom instance on unmount or reload
      return () => {
        instance.dispose();
      };
    }
  }, [isLoading]);

  // Enable or disable panzoom navigation based on isNavigationMode prop
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
      {/* Show loading overlay while the high-res image is loading */}
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
