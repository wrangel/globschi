// src/components/PanoramaViewer.jsx

import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Marzipano from "marzipano";
import styles from "../styles/PanoramaViewer.module.css";

const DEFAULT_VIEW = { yaw: 0, pitch: 0, fov: Math.PI / 4 };

const PanoramaViewer = ({
  panoPath,
  levels,
  initialViewParameters,
  onReady,
  onError,
}) => {
  const panoramaElement = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!panoPath || !levels?.length || !panoramaElement.current) return;

    // Clean up previous viewer instance if it exists
    viewerRef.current?.destroy();
    viewerRef.current = null;

    // Create Marzipano viewer
    const viewer = new Marzipano.Viewer(panoramaElement.current, {
      stage: {
        pixelRatio: window.devicePixelRatio || 1,
        preserveDrawingBuffer: false,
      },
    });

    // Set explicit black background to prevent flicker
    const canvas = viewer.stage().domElement();
    canvas.style.backgroundColor = "black";
    canvas.style.opacity = "1";

    viewerRef.current = viewer;

    // Create scene geometry and source
    const geometry = new Marzipano.CubeGeometry(levels);
    const source = Marzipano.ImageUrlSource.fromString(
      `${panoPath}/{z}/{f}/{y}/{x}.jpg`,
      { cubeMapPreviewUrl: `${panoPath}/preview.jpg` }
    );

    // Handle errors
    if (onError) {
      source.addEventListener("error", (err) => {
        onError(err);
        // Optionally log
        console.error(`Error loading panorama: ${err.message}`);
      });
    }

    // Use the supplied initial view params or fallback
    let viewParams = DEFAULT_VIEW;
    if (
      initialViewParameters &&
      typeof initialViewParameters.yaw === "number" &&
      typeof initialViewParameters.pitch === "number" &&
      typeof initialViewParameters.fov === "number"
    ) {
      viewParams = initialViewParameters;
    } else {
      console.warn(
        "[PanoramaViewer] initialViewParameters missing or invalid → fallback",
        initialViewParameters
      );
    }

    const limiter = Marzipano.RectilinearView.limit.traditional(
      1024,
      (120 * Math.PI) / 180
    );
    const view = new Marzipano.RectilinearView(viewParams, limiter);

    const scene = viewer.createScene({
      source,
      geometry,
      view,
      pinFirstLevel: true,
    });
    scene.switchTo({ transitionDuration: 1000 });

    // Autorotate setup – persists unless panorama truly changes
    const autorotate = Marzipano.autorotate({
      yawSpeed: 0.075,
      targetPitch: 0,
      targetFov: Math.PI / 2,
    });
    if (typeof viewer.setIdleMovement === "function") {
      viewer.setIdleMovement(3000, autorotate);
    } else {
      viewer.startMovement(autorotate);
    }

    if (onReady) onReady();

    // Cleanup ONLY when actual pano or levels change
    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [panoPath, levels, initialViewParameters, onReady, onError]);

  return (
    <div
      ref={panoramaElement}
      className={styles.panoramaViewer}
      role="application"
      aria-label="360 degree panorama viewer"
    />
  );
};

PanoramaViewer.propTypes = {
  panoPath: PropTypes.string.isRequired,
  levels: PropTypes.arrayOf(
    PropTypes.shape({
      tileSize: PropTypes.number.isRequired,
      size: PropTypes.number.isRequired,
      fallbackOnly: PropTypes.bool,
    })
  ).isRequired,
  initialViewParameters: PropTypes.shape({
    yaw: PropTypes.number,
    pitch: PropTypes.number,
    fov: PropTypes.number,
  }),
  onReady: PropTypes.func,
  onError: PropTypes.func,
};

export default PanoramaViewer;
