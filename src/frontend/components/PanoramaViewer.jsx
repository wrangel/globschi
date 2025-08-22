// src/components/PanoramaViewer.jsx

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const PanoramaViewer = ({ cubeFaces }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current || !cubeFaces) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);

    // Load cubemap
    const urls = [
      cubeFaces.right,
      cubeFaces.left,
      cubeFaces.top,
      cubeFaces.bottom,
      cubeFaces.front,
      cubeFaces.back,
    ];

    const loader = new THREE.CubeTextureLoader();

    let animationFrameId;

    const texture = loader.load(
      urls,
      () => {
        console.log("Cubemap fully loaded");
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.encoding = THREE.sRGBEncoding;
        scene.background = texture;

        // Orbit controls for interaction
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.rotateSpeed = 0.5;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Animation loop
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const onResize = () => {
          if (!containerRef.current) return;
          camera.aspect =
            containerRef.current.clientWidth /
            containerRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          );
        };
        window.addEventListener("resize", onResize);

        // Cleanup
        return () => {
          window.removeEventListener("resize", onResize);
          cancelAnimationFrame(animationFrameId);
          controls.dispose();
          renderer.dispose();
          if (containerRef.current) {
            containerRef.current.removeChild(renderer.domElement);
          }
        };
      },
      (xhr) => {
        console.log(`Cubemap loading: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
        console.error("Error loading cubemap:", error);
      }
    );

    // If you want to start the loop before loaded, comment out above animate and uncomment below (not recommended):
    // function animate() {
    //   animationFrameId = requestAnimationFrame(animate);
    //   renderer.render(scene, camera);
    // }
    // animate();

    // Clean up if cubeFaces changes or component unmounts
    return () => {
      cancelAnimationFrame(animationFrameId);
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
