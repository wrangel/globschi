// src/components/PanoramaViewer.jsx

import { useRef, useEffect } from "react";
import Marzipano from "marzipano";
import * as THREE from "three";

const PanoramaViewer = ({ thumbnailUrl, onReady }) => {
  const panoramaElement = useRef(null);

  useEffect(() => {
    if (!thumbnailUrl || !panoramaElement.current) return;

    try {
      const viewer = Marzipano.Viewer(panoramaElement.current);

      const pano = {
        source: Marzipano.imageTilesSource.create({
          prefixUrl: thumbnailUrl,
          tileWidth: 512,
          tileHeight: 512,
          cols: 8,
          rows: 8,
          faces: ["b", "d", "f", "l", "r", "u"],
        }),
      };

      const scene = viewer.createScene({
        source: pano.source,
        yaw: -Math.PI / 2,
        pitch: 0,
        fov: Math.PI / 2,
      });

      scene.defaultView.lookAt(new THREE.Vector3(0, 0, 0));

      if (onReady) {
        onReady();
      }

      return () => {
        viewer.destroy();
      };
    } catch (error) {
      console.error("Error initializing Marzipano viewer:", error);
    }
  }, [thumbnailUrl, onReady]);

  return (
    <div
      ref={panoramaElement}
      className="panoramaViewer"
      aria-label="Marzipano Panorama Viewer"
    />
  );
};

export default PanoramaViewer;
