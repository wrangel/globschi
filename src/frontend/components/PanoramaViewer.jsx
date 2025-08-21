// src/components/PanoramaViewer.jsx

import { useEffect, useRef, useState } from "react";
import Marzipano from "marzipano";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import styles from "../styles/PanoramaViewer.module.css";

const PanoramaViewer = ({
  imageUrl,
  thumbnailUrl,
  cubeFaces,
  isNavigationMode,
  onReady,
}) => {
  const marzipanoContainerRef = useRef(null);
  const marzipanoViewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerType, setViewerType] = useState("psv"); // "psv" or "marzipano"

  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("safari") > -1 && ua.indexOf("chrome") === -1;
  };

  useEffect(() => {
    if (
      !marzipanoContainerRef.current ||
      !cubeFaces ||
      !["front", "back", "left", "right", "top", "bottom"].every(
        (face) => cubeFaces[face]
      )
    ) {
      setViewerType("psv");
      setIsLoading(true);
      return;
    }

    const { width, height } =
      marzipanoContainerRef.current.getBoundingClientRect();

    if (width === 0 || height === 0) {
      // Container not yet sized, defer initialization briefly
      const timeout = setTimeout(() => {
        // Trigger effect re-run
        setIsLoading(true);
        setViewerType("marzipano");
      }, 50);

      return () => clearTimeout(timeout);
    }

    // Initialize Marzipano viewer
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
      up: cubeFaces.top, // map top to up
      down: cubeFaces.bottom, // map bottom to down
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

  if (isSafari()) {
    return (
      <div className={styles.errorOverlay}>
        <div className={styles.errorMessage}>
          <h1>Safari Does Not Support This Feature.</h1>
          <p>Please try using a different browser like Chrome or Firefox.</p>
        </div>
      </div>
    );
  }

  if (viewerType === "psv") {
    const plugins = [
      [AutorotatePlugin, { autorotateSpeed: "2rpm", autostartDelay: 2000 }],
    ];

    return (
      <div className={styles.panoramaViewer}>
        <ReactPhotoSphereViewer
          src={imageUrl}
          height="100vh"
          width="100%"
          onReady={(instance) => {
            setIsLoading(false);
            if (typeof onReady === "function") onReady(instance);
            if (!isNavigationMode) {
              const autorotate = instance.getPlugin(AutorotatePlugin);
              autorotate?.start();
            }
          }}
          plugins={plugins}
          navbar={false}
        />
        {isLoading && thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className={styles.thumbnail}
          />
        )}
      </div>
    );
  }

  return (
    <div
      ref={marzipanoContainerRef}
      className={styles.panoramaViewer}
      style={{ height: "100vh", width: "100%" }}
      aria-label="Cubemap Panorama Viewer"
    >
      {isLoading && thumbnailUrl && (
        <img src={thumbnailUrl} alt="Thumbnail" className={styles.thumbnail} />
      )}
    </div>
  );
};

export default PanoramaViewer;
