// src/components/PanoramaViewer.js

import React, { useState, useCallback } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";

const panoMaxFov = 110; // Maximum field of view
const panoMinFov = 10; // Minimum field of view

const animatedValues = {
  pitch: { start: -Math.PI / 2, end: -0.1 }, // Start at the bottom, end slightly above
  yaw: { start: Math.PI, end: 0 }, // Start facing backward, end facing forward
  zoom: { start: 0, end: 50 }, // Start zoomed out, end zoomed in
  fisheye: { start: 2, end: 0 }, // Start with fisheye effect
};

const PanoramaViewer = ({ url }) => {
  const [viewer, setViewer] = useState(null);
  const [hasError, setHasError] = useState(false); // State to track loading error

  const handleReady = useCallback((instance) => {
    setViewer(instance);
    instance.setOptions({
      fisheye: true,
    });
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
    <div className="panorama-container">
      {hasError ? (
        <div className="fallback-content">
          <p>Failed to load panorama. Please try again later.</p>
          {/* Optionally add a fallback image */}
          <img src="path/to/fallback-image.jpg" alt="Fallback" />
        </div>
      ) : (
        <ReactPhotoSphereViewer
          src={url}
          height="100%"
          width="100%"
          defaultZoomLvl={50}
          maxFov={panoMaxFov}
          minFov={panoMinFov}
          touchmoveTwoFingers={true}
          littlePlanet={true}
          navbar={["fullscreen"]}
          onReady={handleReady}
          onError={() => setHasError(true)} // Handle loading error
        />
      )}
    </div>
  );
};

export default PanoramaViewer;
