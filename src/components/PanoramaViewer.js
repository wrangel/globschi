// src/components/PanoramaViewer.js

import React, { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";

import "@photo-sphere-viewer/core/dist/index.cjs"; // Correct way to import CSS
import "@photo-sphere-viewer/autorotate-plugin/dist/index.cjs"; // Correct way to import CSS

const PanoramaViewer = ({ url }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const panoMaxFov = 110;
    const panoMinFov = 10;

    const animatedValues = {
      pitch: { start: -Math.PI / 2, end: -0.1 },
      yaw: { start: Math.PI, end: 0 },
      zoom: { start: 0, end: 50 },
      fisheye: { start: 2, end: 0 },
    };

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: url,
      maxFov: panoMaxFov,
      minFov: panoMinFov,
      defaultPitch: animatedValues.pitch.start,
      defaultYaw: animatedValues.yaw.start,
      defaultZoomLvl: animatedValues.zoom.end,
      fisheye: animatedValues.fisheye.start,
      navbar: [
        "autorotate",
        "zoom",
        "fullscreen",
        {
          id: "fisheye",
          content: "🐟",
          title: "Fisheye view",
          className: "fisheye-button",
          onClick: (viewer) => {
            autorotate.stop();
            viewer.setOptions({
              fisheye: true,
              maxFov: 160,
            });
          },
        },
        {
          id: "panorama",
          content: "🌐",
          title: "Panorama view",
          className: "panorama-button",
          onClick: () => intro(),
        },
      ],
      plugins: [
        [
          AutorotatePlugin,
          {
            autostartDelay: null,
            autostartOnIdle: false,
            autorotatePitch: animatedValues.pitch.end,
            autorotateSpeed: 0.11,
          },
        ],
      ],
    });

    viewerRef.current = viewer;

    const autorotate = viewer.getPlugin(AutorotatePlugin);

    function intro() {
      autorotate.stop();
      viewer
        .animate({
          properties: animatedValues,
          duration: 6000,
          easing: "inOutQuad",
          onTick: (properties) => {
            viewer.setOption("fisheye", properties.fisheye);
            viewer.rotate({ yaw: properties.yaw, pitch: properties.pitch });
            viewer.zoom(properties.zoom);
          },
        })
        .then(() => {
          autorotate.start();
        });
    }

    viewer.addEventListener("ready", intro, { once: true });

    return () => {
      viewer.destroy();
    };
  }, [url]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default PanoramaViewer;
