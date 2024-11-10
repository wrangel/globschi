// src/components/PanoramaViewer.js

import React, { useState, useCallback } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import styles from "../styles/PanoramaViewer.module.css";

const panoMaxFov = 110; // Maximum field of view
const panoMinFov = 10; // Minimum field of view

const animatedValues = {
  pitch: { start: -Math.PI / 2, end: -0.1 }, // Start at the bottom, end slightly above
  yaw: { start: Math.PI, end: 0 }, // Start facing backward, end facing forward
  zoom: { start: 0, end: 50 }, // Start zoomed out, end zoomed in
  fisheye: { start: 2, end: 0 }, // Start with fisheye effect
};

export default function PanoramaViewer({ imageUrl, thumbnailUrl }) {
  const [viewer, setViewer] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const handleReady = useCallback((instance) => {
    setViewer(instance);
    instance.setOptions({
      fisheye: true,
    });
    setIsLoading(false); // Panorama has loaded
    intro(instance);
  }, []);

  const intro = (viewer) => {
    const duration = 6000; // Animation duration in milliseconds
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // Normalize progress between 0 and 1

      // Interpolate properties based on progress
      const currentPitch =
        animatedValues.pitch.start +
        (animatedValues.pitch.end - animatedValues.pitch.start) * progress;
      const currentYaw =
        animatedValues.yaw.start +
        (animatedValues.yaw.end - animatedValues.yaw.start) * progress;
      const currentZoom =
        animatedValues.zoom.start +
        (animatedValues.zoom.end - animatedValues.zoom.start) * progress;
      const currentFisheye =
        animatedValues.fisheye.start +
        (animatedValues.fisheye.end - animatedValues.fisheye.start) * progress;

      viewer.setOptions({
        fisheye: currentFisheye,
      });

      viewer.rotate({ yaw: currentYaw, pitch: currentPitch });
      viewer.zoom(currentZoom);

      if (progress < 1) {
        requestAnimationFrame(animate); // Continue animating until complete
      }
    };

    requestAnimationFrame(animate); // Start the animation loop
  };

  return (
    <div className={styles.panoView}>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className={styles.thumbnail}
            />
          )}
          <div className={styles.spinner}></div>{" "}
          {/* Add spinner style in CSS */}
        </div>
      )}
      {imageUrl ? (
        <ReactPhotoSphereViewer
          src={imageUrl}
          height="100vh" // Set height to fill the screen
          width="100%"
          defaultZoomLvl={50}
          maxFov={panoMaxFov}
          minFov={panoMinFov}
          touchmoveTwoFingers={true}
          littlePlanet={true}
          navbar={["fullscreen"]} // Only include fullscreen icon
          onReady={handleReady}
        />
      ) : (
        <div>No panorama URL provided</div>
      )}
    </div>
  );
}
