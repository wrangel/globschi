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
 * @param {Function} [props.onError] - Optional callback invoked on tile-load errors.
 *
 * @returns {JSX.Element} The container element where the panorama renders.
 */
const PanoramaViewer = ({ panoPath, onReady, onError }) => {
  const panoramaElement = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!panoPath || !panoramaElement.current) return;

    // Destroy any previous viewer to prevent leaks & race conditions
    viewerRef.current?.destroy();

    // Initialize new viewer with retina support
    const viewer = new Marzipano.Viewer(panoramaElement.current, {
      stage: { pixelRatio: window.devicePixelRatio || 1 },
    });
    viewerRef.current = viewer;

    // Configure image levels for multiresolution cube tiles
    const levels = [
      { tileSize: 256, size: 256, fallbackOnly: true },
      { tileSize: 512, size: 512 },
      { tileSize: 512, size: 1024 },
    ];
    const geometry = new Marzipano.CubeGeometry(levels);

    // Configure source URL pattern for tiles with preview image
    const source = Marzipano.ImageUrlSource.fromString(
      `${panoPath}/{z}/{f}/{y}/{x}.jpg`,
      { cubeMapPreviewUrl: `${panoPath}/../preview.jpg` }
    );

    // Optional error handling
    if (onError) {
      source.addEventListener("error", onError);
    }

    // Create view with yaw and pitch limits
    const limiter = Marzipano.RectilinearView.limit.traditional(
      1024,
      (120 * Math.PI) / 180
    );
    const view = new Marzipano.RectilinearView(null, limiter);

    // Create and activate scene
    const scene = viewer.createScene({
      source,
      geometry,
      view,
      pinFirstLevel: true,
    });
    scene.switchTo({ transitionDuration: 1000 });

    // Setup autorotation after 3 seconds idle
    const autorotate = Marzipano.autorotate({
      yawSpeed: 0.07,
      targetPitch: 0,
      targetFov: Math.PI / 2,
    });
    if (typeof viewer.setIdleMovement === "function") {
      viewer.setIdleMovement(3000, autorotate);
    } else {
      viewer.startMovement(autorotate);
    }

    if (onReady) onReady();

    // Cleanup: stop autorotation, destroy viewer, clear ref
    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [panoPath, onReady, onError]);

  return (
    <div
      ref={panoramaElement}
      style={{ width: "100%", height: "100vh" }}
      role="application"
      aria-label="360 degree panorama viewer"
    />
  );
};

export default PanoramaViewer;
