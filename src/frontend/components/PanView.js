// src/components/PanView.js

import React, { useState, useCallback } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";

const panoMaxFov = 110; // Maximum field of view
const panoMinFov = 10; // Minimum field of view

export default function PanView({ imageUrl }) {
  const [viewer, setViewer] = useState(null);

  const handleReady = useCallback((instance) => {
    setViewer(instance);
    instance.setOptions({
      fisheye: true,
    });

    // Start any animations if needed
    intro(instance);
  }, []);

  const intro = (viewer) => {
    const duration = 6000; // Animation duration in milliseconds
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // Normalize progress between 0 and 1

      viewer.rotate({
        yaw: Math.PI * progress,
        pitch: -Math.PI / 2 + 0.1 * progress,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate); // Start animation loop
  };

  return (
    <div className="pan-view">
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
          navbar={["fullscreen"]}
          onReady={handleReady}
        />
      ) : (
        <div>No panorama URL provided</div>
      )}
    </div>
  );
}
