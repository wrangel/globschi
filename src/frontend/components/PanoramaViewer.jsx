// src/components/PanoramaViewer.jsx

// src/components/PanoramaViewer.jsx

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const PanoramaViewer = ({ cubeFaces }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current || !cubeFaces) return;

    // THREE.js scene setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // CubeTextureLoader expects array in order: right, left, top, bottom, front, back
    const urls = [
      cubeFaces.right,
      cubeFaces.left,
      cubeFaces.top,
      cubeFaces.bottom,
      cubeFaces.front,
      cubeFaces.back,
    ];

    const loader = new THREE.CubeTextureLoader();

    const texture = loader.load(
      urls,
      () => {
        console.log("Cubemap fully loaded");
      },
      (xhr) => {
        console.log(`Cubemap loading: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error("Error loading cubemap:", error);
      }
    );

    // Use cubemap as background
    scene.background = texture;

    // Optional: Add OrbitControls for interaction if you want

    // Animation loop
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const onResize = () => {
      if (!containerRef.current) return;
      camera.aspect =
        containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };

    window.addEventListener("resize", onResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [cubeFaces]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100vh", backgroundColor: "black" }}
      aria-label="Three.js Cube Map Panorama Viewer"
    />
  );
};

export default PanoramaViewer;
