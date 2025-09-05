// src/frontend/components/ImagePopup.jsx

import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import LoadingOverlay from "./LoadingOverlay";
import panzoom from "panzoom";
import styles from "../styles/ImagePopup.module.css";

/**
 * ImagePopup component
 * Displays a zoomable and pannable image with a loading indicator.
 *
 * Props:
 * - actualUrl: URL of the high-resolution image.
 * - thumbnailUrl: URL of the loading thumbnail image for placeholder.
 * - name: Alt text for the image.
 * - isNavigationMode: Enables or disables pan/zoom interaction.
 * - onLoad: Callback after image is loaded.
 */
const ImagePopup = ({
  actualUrl,
  thumbnailUrl,
  name,
  isNavigationMode,
  onLoad,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef(null);
  const panZoomInstanceRef = useRef(null);

  // Preload high-res image and update loading state
  useEffect(() => {
    setIsLoading(true);
    const img = new Image();
    img.src = actualUrl;

    img.onload = () => {
      setIsLoading(false);
      if (onLoad) onLoad();
    };

    // Optional: handle loading errors here if needed
  }, [actualUrl, onLoad]);

  // Disable page scrolling when image is loaded (modal active)
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

  // Initialize panzoom for image container after image loads
  useEffect(() => {
    if (!isLoading && imgRef.current) {
      const instance = panzoom(imgRef.current);
      panZoomInstanceRef.current = instance;

      return () => {
        instance.dispose();
      };
    }
  }, [isLoading]);

  // Toggle panzoom navigation based on isNavigationMode prop
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

ImagePopup.propTypes = {
  actualUrl: PropTypes.string.isRequired,
  thumbnailUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isNavigationMode: PropTypes.bool.isRequired,
  onLoad: PropTypes.func,
};

export default ImagePopup;
