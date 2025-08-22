// src/components/PanoramaViewer.jsx

import { useRef, useEffect } from "react";
import Marzipano from "marzipano";

const PanoramaViewer = ({ panoPath, onReady }) => {
  const panoramaElement = useRef(null);

  useEffect(() => {
    if (!panoPath || !panoramaElement.current) return;

    const viewer = new Marzipano.Viewer(panoramaElement.current);

    const levels = [
      { tileSize: 256, size: 256, fallbackOnly: true },
      { tileSize: 512, size: 512 },
      { tileSize: 512, size: 1024 },
      // Add higher resolutions if you have them
    ];

    const geometry = new Marzipano.CubeGeometry(levels);

    const source = Marzipano.ImageUrlSource.fromString(
      `${panoPath}/{z}/{f}/{y}/{x}.jpg`,
      {
        cubeMapPreviewUrl: `${panoPath}/../preview.jpg`,
      }
    );

    const limiter = Marzipano.RectilinearView.limit.traditional(
      1024,
      (120 * Math.PI) / 180
    );

    const view = new Marzipano.RectilinearView(null, limiter);

    const scene = viewer.createScene({
      source,
      geometry,
      view,
      pinFirstLevel: true,
    });

    scene.switchTo({ transitionDuration: 1000 });

    if (onReady) onReady();

    return () => {
      viewer.destroy();
    };
  }, [panoPath, onReady]);

  return (
    <div ref={panoramaElement} style={{ width: "100%", height: "100vh" }} />
  );
};

export default PanoramaViewer;
