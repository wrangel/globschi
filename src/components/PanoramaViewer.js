// src/components/PanoramaViewer.js
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PanoramaViewer = ({ url }) => {
  const containerRef = useRef(null);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchDistance, setPinchDistance] = useState(0);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const texture = new THREE.TextureLoader().load(url);
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.set(0, 0, 0.1);

    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.y += 0.001; // Autorotate
      renderer.render(scene, camera);
    };

    const tinyPlanetEffect = () => {
      camera.fov = 160;
      camera.updateProjectionMatrix();
      camera.position.set(0, 0, 300);
    };

    const flyInAnimation = () => {
      let progress = 0;
      const flyIn = () => {
        if (progress < 1) {
          progress += 0.02;
          camera.position.z = THREE.MathUtils.lerp(300, 0.1, progress);
          camera.fov = THREE.MathUtils.lerp(160, 75, progress);
          camera.updateProjectionMatrix();
          requestAnimationFrame(flyIn);
        }
      };
      flyIn();
    };

    tinyPlanetEffect();
    flyInAnimation();
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [url]);

  const getDistance = (touch1, touch2) => {
    return Math.sqrt(
      Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
    );
  };

  const handlePinchStart = (e) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      setPinchDistance(getDistance(e.touches[0], e.touches[1]));
    }
  };

  const handlePinchMove = (e) => {
    if (isPinching && e.touches.length === 2) {
      const newDistance = getDistance(e.touches[0], e.touches[1]);
      const delta = newDistance - pinchDistance;

      // Adjust the camera's FOV based on the pinch gesture
      cameraRef.current.fov = Math.max(
        30,
        Math.min(90, cameraRef.current.fov - delta * 0.1)
      );
      cameraRef.current.updateProjectionMatrix();

      setPinchDistance(newDistance);
    }
  };

  const handlePinchEnd = () => {
    setIsPinching(false);
  };

  const handleWheel = (e) => {
    cameraRef.current.fov = Math.max(
      30,
      Math.min(90, cameraRef.current.fov + e.deltaY * 0.05)
    );
    cameraRef.current.updateProjectionMatrix();
  };

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      onTouchStart={handlePinchStart}
      onTouchMove={handlePinchMove}
      onTouchEnd={handlePinchEnd}
      onWheel={handleWheel}
    />
  );
};

export default PanoramaViewer;
