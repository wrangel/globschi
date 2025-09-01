// src/components/PanoramaViewer.jsx
import { useRef, useEffect } from "react";
import Marzipano from "marzipano";

const DEFAULT_VIEW = { yaw: 0, pitch: 0, fov: Math.PI / 4 };

const PanoramaViewer = (props) => {
  const {
    panoPath,
    initialViewParameters,
    onReady,
    onError,
    // …collect anything else here if you ever extend the API
  } = props;

  const panoramaElement = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!panoPath || !panoramaElement.current) return;

    viewerRef.current?.destroy();

    const viewer = new Marzipano.Viewer(panoramaElement.current, {
      stage: { pixelRatio: window.devicePixelRatio || 1 },
    });
    viewerRef.current = viewer;

    const levels = [
      { tileSize: 256, size: 256, fallbackOnly: true },
      { tileSize: 512, size: 512 },
      { tileSize: 512, size: 1024 },
    ];
    const geometry = new Marzipano.CubeGeometry(levels);
    const source = Marzipano.ImageUrlSource.fromString(
      `${panoPath}/{z}/{f}/{y}/{x}.jpg`,
      { cubeMapPreviewUrl: `${panoPath}/preview.jpg` }
    );

    if (onError) source.addEventListener("error", onError);

    // Safe extraction + fallback
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
  }, [panoPath, initialViewParameters, onReady, onError]);

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
