// src/components/PanoramaViewer.jsx

import { useRef, useEffect } from "react";
import Marzipano from "marzipano";

/**
 * PanoramaViewer component for displaying a 360° panorama using Marzipano.
 *
 * Initializes a Marzipano viewer on a container element and sets up the panorama scene
 * with cube geometry and multiresolution tiles. Includes autorotation when idle.
 *
 * @param {Object} props - Component props.
 * @param {string} props.panoPath - Base URL path to panorama tile images.
 * @param {Function} [props.onReady] - Optional callback invoked when viewer is ready.
 *
 * @returns {JSX.Element} The container element where the panorama renders.
 */
const PanoramaViewer = ({ panoPath, onReady }) => {
  const panoramaElement = useRef(null);

  useEffect(() => {
    if (!panoPath || !panoramaElement.current) return;

    // Initialize Marzipano viewer on the container
    const viewer = new Marzipano.Viewer(panoramaElement.current);

    // Configure image levels for multiresolution cube tiles
    const levels = [
      { tileSize: 256, size: 256, fallbackOnly: true },
      { tileSize: 512, size: 512 },
      { tileSize: 512, size: 1024 },
    ];

    // Define cube geometry based on levels
    const geometry = new Marzipano.CubeGeometry(levels);

    // Configure source URL pattern for tiles with preview image
    const source = Marzipano.ImageUrlSource.fromString(
      `${panoPath}/{z}/{f}/{y}/{x}.jpg`,
      {
        cubeMapPreviewUrl: `${panoPath}/../preview.jpg`,
      }
    );

    // Create view with yaw and pitch limits
    const limiter = Marzipano.RectilinearView.limit.traditional(
      1024,
      (120 * Math.PI) / 180
    );
    const view = new Marzipano.RectilinearView(null, limiter);

    // Create and activate scene with above source, geometry, and view
    const scene = viewer.createScene({
      source,
      geometry,
      view,
      pinFirstLevel: true,
    });

    scene.switchTo({ transitionDuration: 1000 });

    // Setup autorotation motion after 3 seconds idle
    const autorotate = Marzipano.autorotate({
      yawSpeed: 0.05, // Adjust rotation speed
      targetPitch: 0, // Level pitch forward
      targetFov: Math.PI / 2,
    });

    // Start autorotate only after user is idle
    viewer.setIdleMovement(autorotate);
    viewer.setIdleDelay(3000); // in ms → 3s of idle before rotating

    if (onReady) onReady();

    // Cleanup function to destroy viewer on unmount or panoPath change
    return () => {
      scene.destroy(); // explicitly destroy scene instance
      viewer.destroy(); // then destroy viewer context
    };
  }, [panoPath, onReady]);

  return (
    <div ref={panoramaElement} style={{ width: "100%", height: "100vh" }} />
  );
};

export default PanoramaViewer;
