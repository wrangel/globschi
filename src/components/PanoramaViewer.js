// src/components/PanoramaViewer.js
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const PanoramaViewer = ({ url }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let scene, camera, renderer, sphere, texture;

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current.appendChild(renderer.domElement);

      texture = new THREE.TextureLoader().load(url);
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);

      camera.position.set(0, 0, 0.1);
    };

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

    init();
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

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default PanoramaViewer;
