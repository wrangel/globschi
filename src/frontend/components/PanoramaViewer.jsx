import React, { useEffect, useRef } from "react";
import Marzipano from "marzipano";

const PanoramaViewer = () => {
  const viewerRef = useRef(null);
  const panoRef = useRef(null);

  useEffect(() => {
    if (!panoRef.current) return;

    // Initialize Marzipano viewer
    const viewer = new Marzipano.Viewer(panoRef.current);

    // Define the levels of resolution matching the exported tiles
    const levels = [
      { tileSize: 512, size: 512, fallbackOnly: true },
      { tileSize: 512, size: 1024 },
      { tileSize: 512, size: 2048 },
      { tileSize: 512, size: 4096 },
    ];

    // Cube geometry for tiles
    const geometry = new Marzipano.CubeGeometry(levels);

    // Image tile URL pattern including nested folder structure
    const source = Marzipano.ImageUrlSource.fromString(
      "https://melville-island.s3.amazonaws.com/pan/20250813_001_0006/tiles/0-20250813_001_0006/{z}/{f}/{y}/{x}.jpg"
    );

    // View settings: initial yaw, pitch and field of view
    const view = new Marzipano.RectilinearView({
      yaw: 0,
      pitch: 0,
      fov: Math.PI / 3,
    });

    // Create the scene
    const scene = viewer.createScene({
      source,
      geometry,
      view,
      pinFirstLevel: true,
    });

    // Display the scene
    scene.switchTo();

    // Save viewer instance for cleanup
    viewerRef.current = viewer;

    // Cleanup on unmount
    return () => {
      if (viewerRef.current) viewerRef.current.destroy();
    };
  }, []);

  return (
    <div
      ref={panoRef}
      style={{ width: "100vw", height: "100vh", backgroundColor: "black" }}
    />
  );
};

export default PanoramaViewer;
