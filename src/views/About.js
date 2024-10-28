// src/views/About.js

import React from "react";
import "../styles/about.css"; // Import your specific CSS for this component

const About = () => {
  return (
    <div className="about-container">
      <h2>That's us!</h2>

      <h1>Drone</h1>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.dji.com/ch/mini-4-pro"
        >
          DJI Mini 4 Pro
        </a>
      </p>

      <h1>Image and Net Works</h1>
      <p>
        <a target="_blank" rel="noopener noreferrer" href="https://ptgui.com">
          PTGui Pro
        </a>{" "}
        for equirectangular 360&deg; panorama stitching and most skyfills
      </p>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://stuvel.eu/software/skyfill/"
        >
          Skyfill
        </a>{" "}
        for the remaining skyfills
      </p>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.adobe.com/products/photoshop-lightroom.html"
        >
          Adobe Lightroom{" "}
        </a>{" "}
        for wide angle &amp; HDR image creation
      </p>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://photo-sphere-viewer.js.org/"
        >
          Photo Sphere Viewer XXXXXX
        </a>{" "}
        for the fantastic 360&deg; panorama display
      </p>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://mariushosting.com/"
        >
          Marius Hosting
        </a>{" "}
        for ramping my network knowledge up very quickly
      </p>

      <h1>Personnel</h1>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/wrangel"
        >
          wrangel
        </a>
        ,
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.youtube.com/@beatmaker3462"
        >
          beat maker
        </a>
        &amp; dance
      </p>
    </div>
  );
};

export default About;
