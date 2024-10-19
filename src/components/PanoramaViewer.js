import React, { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";

const PanoramaViewer = ({ url, onInteractionStart, onInteractionEnd }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const sphereRef = useRef(null);
  const isUserInteractingRef = useRef(false);
  const onPointerDownMouseXRef = useRef(0);
  const onPointerDownMouseYRef = useRef(0);
  const lonRef = useRef(0);
  const latRef = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0);
  const distanceRef = useRef(50);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchDistance, setPinchDistance] = useState(0);
  const interactionTimeoutRef = useRef(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const lastClickTimeRef = useRef(0);

  const startInteraction = useCallback(() => {
    if (!isUserInteractingRef.current) {
      isUserInteractingRef.current = true;
      onInteractionStart();
    }
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
  }, [onInteractionStart]);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      distanceRef.current = Math.max(
        1,
        Math.min(1000, distanceRef.current + e.deltaY * 0.05)
      );
      startInteraction();
    },
    [startInteraction]
  );

  const getDistance = useCallback((touch1, touch2) => {
    return Math.sqrt(
      Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
    );
  }, []);

  const endInteraction = useCallback(() => {
    interactionTimeoutRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
      setIsPinching(false);
      onInteractionEnd();
    }, 200);
  }, [onInteractionEnd]);

  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    const currentTime = new Date().getTime();
    const timeSinceLastClick = currentTime - lastClickTimeRef.current;

    if (timeSinceLastClick < 300) {
      // 300ms threshold for double-click
      setIsAutoRotating((prev) => !prev);
    }

    lastClickTimeRef.current = currentTime;
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      startInteraction();

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      onPointerDownMouseXRef.current = clientX;
      onPointerDownMouseYRef.current = clientY;

      if (e.touches && e.touches.length === 2) {
        setIsPinching(true);
        setPinchDistance(getDistance(e.touches[0], e.touches[1]));
      }
    },
    [getDistance, startInteraction]
  );

  const onPointerMove = useCallback(
    (e) => {
      e.preventDefault();
      if (!isUserInteractingRef.current) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      if (isPinching && e.touches && e.touches.length === 2) {
        const newDistance = getDistance(e.touches[0], e.touches[1]);
        const delta = newDistance - pinchDistance;
        distanceRef.current = Math.max(
          1,
          Math.min(1000, distanceRef.current - delta * 0.1)
        );
        setPinchDistance(newDistance);
      } else if (
        (e.touches && e.touches.length === 2) ||
        e.buttons === 1 ||
        (e.touches && e.touches.length === 1)
      ) {
        const movementX = (clientX - onPointerDownMouseXRef.current) * 0.1;
        const movementY = (clientY - onPointerDownMouseYRef.current) * 0.1;

        lonRef.current -= movementX;
        latRef.current -= movementY;

        onPointerDownMouseXRef.current = clientX;
        onPointerDownMouseYRef.current = clientY;
      }
    },
    [isPinching, pinchDistance, getDistance]
  );

  const onPointerUp = useCallback(
    (e) => {
      e.preventDefault();
      endInteraction();
    },
    [endInteraction]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1100
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: containerRef.current,
    });

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth, window.innerHeight);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (texture) => {
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.mapping = THREE.EquirectangularReflectionMapping;

      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const sphere = new THREE.Mesh(geometry, material);
      sphereRef.current = sphere;
      scene.add(sphere);

      animate();
    });

    const animate = () => {
      requestAnimationFrame(animate);

      if (!isUserInteractingRef.current && isAutoRotating) {
        lonRef.current += 0.03; // Autorotation
      }

      latRef.current = Math.max(-85, Math.min(85, latRef.current));
      phiRef.current = THREE.MathUtils.degToRad(90 - latRef.current);
      thetaRef.current = THREE.MathUtils.degToRad(lonRef.current);

      camera.position.x =
        distanceRef.current *
        Math.sin(phiRef.current) *
        Math.cos(thetaRef.current);
      camera.position.y = distanceRef.current * Math.cos(phiRef.current);
      camera.position.z =
        distanceRef.current *
        Math.sin(phiRef.current) *
        Math.sin(thetaRef.current);

      camera.lookAt(scene.position);
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
  }, [url, isAutoRotating]);

  return (
    <canvas
      ref={containerRef}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
      onMouseDown={onPointerDown}
      onMouseMove={onPointerMove}
      onMouseUp={onPointerUp}
      onMouseLeave={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    />
  );
};

export default PanoramaViewer;
