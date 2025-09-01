import { useRef, useEffect } from "react";
import Marzipano from "marzipano";

const PanoramaViewer = ({
  panoPath,
  initialViewParameters,
  onReady,
  onError,
}) => {
  const panoramaElement = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!panoPath || !panoramaElement.current) return;

    // Destroy previous viewer instance, if any
    viewerRef.current?.destroy();

    // Initialize Marzipano viewer
    const viewer = new Marzipano.Viewer(panoramaElement.current, {
      stage: { pixelRatio: window.devicePixelRatio || 1 },
    });
    viewerRef.current = viewer;

    // Configure levels and geometry
    const levels = [
      { tileSize: 256, size: 256, fallbackOnly: true },
      { tileSize: 512, size: 512 },
      { tileSize: 512, size: 1024 },
    ];
    const geometry = new Marzipano.CubeGeometry(levels);

    // Create source using panoPath
    const source = Marzipano.ImageUrlSource.fromString(
      `${panoPath}/{z}/{f}/{y}/{x}.jpg`,
      {
        cubeMapPreviewUrl: `${panoPath}/preview.jpg`,
      }
    );

    // Attach error handler
    if (onError) {
      source.addEventListener("error", onError);
    }

    // Create view limits
    const limiter = Marzipano.RectilinearView.limit.traditional(
      1024,
      (120 * Math.PI) / 180
    );

    // Use initialViewParameters or fallback defaults
    const initialView = initialViewParameters || {
      yaw: 0,
      pitch: 0,
      fov: Math.PI / 2,
    };

    // Initialize view with initial yaw, pitch, fov
    const view = new Marzipano.RectilinearView(initialView, limiter);

    // Create and switch to scene
    const scene = viewer.createScene({
      source,
      geometry,
      view,
      pinFirstLevel: true,
    });
    scene.switchTo({ transitionDuration: 1000 });

    // Set up autorotate
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

    // Cleanup on unmount
    return () => viewerRef.current?.destroy();
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
