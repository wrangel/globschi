// src/components/PanoramaViewer.js

import React, { useState, useCallback } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";

const panoMaxFov = 110; // Maximum field of view
const panoMinFov = 10; // Minimum field of view

const animatedValues = {
  pitch: { start: -Math.PI / 2, end: -0.1 },
  yaw: { start: Math.PI, end: 0 },
  zoom: { start: 0, end: 50 },
  fisheye: { start: 2, end: 0 },
};

const PanoramaViewer = ({ url }) => {
  // eslint-disable-next-line no-unused-vars
  const [viewer, setViewer] = useState(null);

  const handleReady = useCallback((instance) => {
    setViewer(instance);
    instance.setOptions({
      fisheye: true,
    });
    intro(instance);
  }, []);

  const intro = (viewer) => {
    const duration = 6000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
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
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="panorama-container">
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
      />
    </div>
  );
};

export default PanoramaViewer;
