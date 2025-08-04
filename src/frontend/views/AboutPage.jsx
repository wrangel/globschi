// src/frontend/views/AboutPage.js

import React from "react";
import { Helmet } from "react-helmet-async";
import { DOMAIN } from "../constants";
import styles from "../styles/About.module.css";

const About = () => {
  return (
    <>
      <Helmet>
        <link rel="canonical" href={`${DOMAIN}about`} />
        <title>About Abstract Altitudes - Our Team and Tools</title>
        <meta
          name="description"
          content="Meet the team behind Abstract Altitudes, learn about our drones, image processing tools, and the technologies we use to create stunning aerial imagery."
        />
      </Helmet>
      <div className={styles.aboutContainer}>
        <h2>
          That's <a href="mailto:contact@abstractaltitudes.com">us</a>!
        </h2>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/wrangel"
          >
            wrangel
          </a>
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.youtube.com/@beatmaker3462"
          >
            beat maker
          </a>
          <br />
          Anna
        </p>

        <h2>Our drones</h2>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.dji.com/mini-4-pro"
          >
            DJI Mini 4 Pro
          </a>
          {" (Globschi)"}
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.dji.com/mini-2"
          >
            DJI Mini 2
          </a>
          {" (Dronef)"}
        </p>

        <h2>Image processing</h2>
        <p>
          <a target="_blank" rel="noopener noreferrer" href="https://ptgui.com">
            PTGui Pro
          </a>
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.adobe.com/products/photoshop-lightroom.html"
          >
            Adobe Lightroom
          </a>
        </p>

        <h2>Shouting out to</h2>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.perplexity.ai/"
          >
            Perplexity AI
          </a>
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://photo-sphere-viewer.js.org/"
          >
            Photo Sphere Viewer
          </a>
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://mariushosting.com/"
          >
            Marius Hosting
          </a>
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.microsoft.com"
          >
            Microsoft Copilot
          </a>
        </p>
      </div>
    </>
  );
};

export default About;
