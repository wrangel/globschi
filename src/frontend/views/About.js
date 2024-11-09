// src/views/About.js

import React from "react";

const About = () => {
  return (
    <div className="about-container">
      <h2>That's us!</h2>

      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/wrangel"
        >
          wrangel
        </a>
        ,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.youtube.com/@beatmaker3462"
        >
          beat maker
        </a>{" "}
        &amp; dance
      </p>

      <h2>Acknowledgements</h2>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.dji.com/ch"
        >
          DJI
        </a>{" "}
        for their drones.
      </p>
      <p>
        <a target="_blank" rel="noopener noreferrer" href="https://ptgui.com">
          PTGui Pro
        </a>{" "}
        for equirectangular 360&deg; panorama stitching.
      </p>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.adobe.com/products/photoshop-lightroom.html"
        >
          Adobe Lightroom
        </a>{" "}
        for wide angle &amp; HDR image creation.
      </p>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://photo-sphere-viewer.js.org/"
        >
          Photo Sphere Viewer XXXXXXX
        </a>{" "}
        for the fantastic 360&deg; panorama display.
      </p>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://mariushosting.com/"
        >
          Marius Hosting
        </a>{" "}
        for ramping my network knowledge up very quickly.
      </p>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.perplexity.ai/"
        >
          Perplexity AI
        </a>{" "}
        for providing advanced AI capabilities that enhance our project.
      </p>
    </div>
  );
};

export default About;
