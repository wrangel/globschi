// src/frontend/components/ViewerPanorama.jsx

import { useRef, useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";
import Marzipano from "marzipano";
import styles from "../styles/ViewerPanorama.module.css";

const DEFAULT_VIEW = { yaw: 0, pitch: 0, fov: Math.PI / 4 };

const ViewerPanorama = ({
  panoPath,
  levels,
  initialViewParameters,
  onReady,
  onError,
}) => {
  const panoramaElement = useRef(null);
  const viewerRef = useRef(null);
  const sceneRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (!panoPath || !levels?.length || !panoramaElement.current) return;

    if (!viewerRef.current) {
      viewerRef.current = new Marzipano.Viewer(panoramaElement.current, {
        stage: {
          pixelRatio: window.devicePixelRatio || 1,
          preserveDrawingBuffer: false,
        },
      });

      const canvas = viewerRef.current.stage().domElement();
      canvas.style.backgroundColor = "black";
      canvas.style.opacity = "1";
    }

    const geometry = new Marzipano.CubeGeometry(levels);

    const source = Marzipano.ImageUrlSource.fromString(
      `${panoPath}/{z}/{f}/{y}/{x}.jpg`,
      { cubeMapPreviewUrl: `${panoPath}/preview.jpg` }
    );

    if (onError) {
      source.addEventListener("error", (err) => {
        onError(err);
        console.error(`Error loading panorama: ${err.message}`);
      });
    }

    let viewParams = DEFAULT_VIEW;
    if (
      initialViewParameters &&
      typeof initialViewParameters.yaw === "number" &&
      typeof initialViewParameters.pitch === "number" &&
      typeof initialViewParameters.fov === "number"
    ) {
      viewParams = initialViewParameters;
    }

    const limiter = Marzipano.RectilinearView.limit.traditional(
      1024,
      (120 * Math.PI) / 180
    );
    const view = new Marzipano.RectilinearView(viewParams, limiter);

    // If scene exists, just update source, geometry, and view
    if (sceneRef.current) {
      sceneRef.current.setSource(source);
      // Don't recreate scene every time; update view params or create new scene carefully
    } else {
      sceneRef.current = viewerRef.current.createScene({
        source,
        geometry,
        view,
        pinFirstLevel: true,
      });
      sceneRef.current.switchTo({ transitionDuration: 1000 });
    }

    // Setup autorotate similar as before
    const autorotate = Marzipano.autorotate({
      yawSpeed: 0.075,
      targetPitch: 0,
      targetFov: Math.PI / 2,
    });

    if (typeof viewerRef.current.setIdleMovement === "function") {
      viewerRef.current.setIdleMovement(3000, autorotate);
    } else {
      viewerRef.current.startMovement(autorotate);
    }

    setLoaded(true);
    if (onReady) onReady();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [panoPath, levels, initialViewParameters, onReady, onError]);

  return (
    <div
      ref={panoramaElement}
      className={styles.ViewerPanorama}
      role="application"
      aria-label="360 degree panorama viewer"
      tabIndex={0}
      style={{ backgroundColor: loaded ? undefined : "black" }}
    />
  );
};

ViewerPanorama.propTypes = {
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

export default ViewerPanorama;
