// src/components/PanoramaViewer.jsx

import { useEffect, useRef, useState } from "react";
import Marzipano from "marzipano";
import styles from "../styles/PanoramaViewer.module.css";

const PanoramaViewer = ({ cubeFaces, onReady }) => {
  const marzipanoContainerRef = useRef(null);
  const marzipanoViewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      !marzipanoContainerRef.current ||
      !cubeFaces ||
      !["front", "back", "left", "right", "top", "bottom"].every(
        (face) => cubeFaces[face]
      )
    ) {
      // Not enough data to initialize
      setIsLoading(true);
      return;
    }

    const { width, height } =
      marzipanoContainerRef.current.getBoundingClientRect();

    if (width === 0 || height === 0) {
      // Container not sized yet, defer init
      const timeout = setTimeout(() => {
        setIsLoading(true);
      }, 50);
      return () => clearTimeout(timeout);
    }

    // Cleanup old viewer if any
    if (marzipanoViewerRef.current) {
      marzipanoViewerRef.current.destroy();
      marzipanoViewerRef.current = null;
    }

    const viewer = new Marzipano.Viewer(marzipanoContainerRef.current);

    const source = Marzipano.ImageUrlSource.fromCubemapFaces({
      front: cubeFaces.front,
      back: cubeFaces.back,
      left: cubeFaces.left,
      right: cubeFaces.right,
      up: cubeFaces.top,
      down: cubeFaces.bottom,
    });

    const geometry = new Marzipano.CubeGeometry([
      { tileSize: 256, size: 256, fallbackOnly: true },
      { tileSize: 512, size: 512 },
      { tileSize: 512, size: 1024 },
    ]);

    const limiter = Marzipano.RectilinearView.limit.traditional(
      1024,
      (100 * Math.PI) / 180
    );

    const view = new Marzipano.RectilinearView({ yaw: Math.PI }, limiter);

    const scene = viewer.createScene({ source, geometry, view });
    scene.switchTo();

    marzipanoViewerRef.current = viewer;

    setIsLoading(false);

    if (typeof onReady === "function") {
      onReady();
    }

    return () => {
      if (marzipanoViewerRef.current) {
        marzipanoViewerRef.current.destroy();
        marzipanoViewerRef.current = null;
      }
    };
  }, [cubeFaces, onReady]);

  return (
    <div
      ref={marzipanoContainerRef}
      className={styles.panoramaViewer}
      style={{ height: "100vh", width: "100%" }}
      aria-label="Cubemap Panorama Viewer"
    >
      {isLoading && (
        <p style={{ color: "white", textAlign: "center" }}>
          Loading panorama...
        </p>
      )}
    </div>
  );
};

export default PanoramaViewer;
