import React from "react";
import styles from "../styles/About.module.css";

const About = () => {
  return (
    <div className={styles.aboutContainer}>
      <h2>That's Us!</h2>
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

      <h2>Our Drones</h2>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.dji.com/mini-4-pro"
        >
          DJI Mini 4 Pro
        </a>
        {" (Globschi), "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.dji.com/mini-2"
        >
          DJI Mini 2
        </a>
        {" (Dronef)"}
      </p>

      <h2>Image Processing</h2>
      <p>
        <a target="_blank" rel="noopener noreferrer" href="https://ptgui.com">
          PTGui Pro
        </a>
        ,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.adobe.com/products/photoshop-lightroom.html"
        >
          Adobe Lightroom
        </a>
      </p>

      <h2>Shouting Out To</h2>
      <p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.perplexity.ai/"
        >
          Perplexity AI
        </a>
        ,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://photo-sphere-viewer.js.org/"
        >
          Photo Sphere Viewer
        </a>
        ,{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://mariushosting.com/"
        >
          Marius Hosting
        </a>
      </p>
    </div>
  );
};

export default About;
