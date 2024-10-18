// src/components/PanoramaViewer.js
import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

const PanoramaViewer = ({ url }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  const handleWheel = useCallback((e) => {
    if (cameraRef.current) {
      cameraRef.current.fov = Math.max(
        30,
        Math.min(90, cameraRef.current.fov + e.deltaY * 0.05)
      );
      cameraRef.current.updateProjectionMatrix();
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );

    // Try to use WebGL 2
    const canvas = containerRef.current;
    const context =
      canvas.getContext("webgl2", { antialias: true }) ||
      canvas.getContext("webgl", { antialias: true });

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      context: context,
      antialias: true,
      powerPreference: "high-performance",
    });

    // Check if WebGL 2 is available
    const isWebGL2 = renderer.capabilities.isWebGL2;
    console.log("Using WebGL 2:", isWebGL2);

    // Check max texture size
    const gl = renderer.getContext();
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    console.log("Max texture size:", maxTextureSize);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);

    // Load and process texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (texture) => {
      // If the texture is larger than the max size, resize it
      if (
        texture.image.width > maxTextureSize ||
        texture.image.height > maxTextureSize
      ) {
        const scale =
          maxTextureSize / Math.max(texture.image.width, texture.image.height);
        texture.image.width *= scale;
        texture.image.height *= scale;
      }

      if (!isWebGL2) {
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
      }

      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      // Start animation after texture is loaded
      animate();
    });

    camera.position.set(0, 0, 0.1);

    const animate = () => {
      requestAnimationFrame(animate);
      scene.rotation.y += 0.001; // Autorotate
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [url]);

  return (
    <canvas
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      onWheel={handleWheel}
    />
  );
};

export default PanoramaViewer;
