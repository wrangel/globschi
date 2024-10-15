// src/components/PanoramaViewer.js
import { useEffect, useRef } from "react";
import * as PANOLENS from "panolens";

function PanoramaViewer({ url }) {
  const viewerRef = useRef(null);

  useEffect(() => {
    const panorama = new PANOLENS.ImagePanorama(url);
    const viewer = new PANOLENS.Viewer({
      container: viewerRef.current,
      autoRotate: true,
      autoRotateSpeed: 0.5,
    });
    viewer.add(panorama);

    return () => {
      viewer.dispose();
    };
  }, [url]);

  return <div ref={viewerRef} style={{ width: "100%", height: "400px" }} />;
}

export default PanoramaViewer;
