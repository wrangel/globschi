// src/components/PanoramaViewer.js
import React, { useRef, useCallback, useState } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import styles from "../styles/PanoramaViewer.module.css";
import LoadingOverlay from "./LoadingOverlay";
import ControlButtons from "./ControlButtons";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation";

const panoMaxFov = 110; // Maximum field of view
const panoMinFov = 10; // Minimum field of view

export default function PanoramaViewer({ imageUrl, thumbnailUrl, onClose }) {
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const handleReady = useCallback((instance) => {
    viewerRef.current = instance;
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

      viewer.rotate({
        yaw: Math.PI * progress,
        pitch: -Math.PI / (2 * (1 - progress)),
      });

      if (progress < 1) {
        requestAnimationFrame(animate); // Continue animating until complete
      }
    };

    requestAnimationFrame(animate); // Start the animation loop
  };

  // Use keyboard navigation hook
  useKeyboardNavigation(
    onClose,
    () => {},
    () => {}
  ); // No previous/next for panorama

  return (
    <div className={styles.panoView}>
      {isLoading && <LoadingOverlay thumbnailUrl={thumbnailUrl} />}
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

      {/* Control Buttons */}
      <ControlButtons
        onClose={onClose}
        onPrevious={() => {}} // No previous for panorama viewer
        onNext={() => {}} // No next for panorama viewer
        onToggleMetadata={() => {}}
      />
    </div>
  );
}
