// src/frontend/views/HomePage.js

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import styles from "../styles/Home.module.css";
import { DOMAIN } from "../constants";

const HomePage = () => {
  const navigate = useNavigate();
  const [isPortrait, setIsPortrait] = useState(
    window.innerHeight > window.innerWidth
  );

  useEffect(() => {
    const handleResize = () =>
      setIsPortrait(window.innerHeight > window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageClick = () => {
    const randomPage = Math.random() < 0.5 ? "/grid" : "/map";
    navigate(randomPage);
  };

  return (
    <>
      <Helmet>
        <title>Abstract Altitudes - Aerial Imagery</title>
        <link rel="canonical" href={DOMAIN} />
        <meta
          name="description"
          content="Explore drone-captured aerial imagery. From lofty heights, we muse on marvels."
        />
      </Helmet>

      <div
        className={`${styles.homePage} ${
          isPortrait ? styles.portraitLayout : ""
        }`}
      >
        <div className={styles.mainContentWrapper}>
          <div className={styles.textWrapper}>
            <h1>
              From lofty heights,
              <br />
              <span className={styles.break}>we muse on marvels</span>
            </h1>
            <h2>Aerial imagery</h2>
          </div>
          <div className={styles.imageWrapper}>
            <img
              src="/globschi.jpg"
              alt="Globschi"
              className={styles.image}
              onClick={handleImageClick}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
        <footer className={styles.credits}>
          <a
            href="https://github.com/wrangel"
            target="_blank"
            rel="noopener noreferrer"
          >
            wrangel
          </a>
          ,{" "}
          <a
            href="https://www.dji.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            DJI
          </a>
          ,{" "}
          <a href="https://ptgui.com" target="_blank" rel="noopener noreferrer">
            PTGui Pro
          </a>
          ,{" "}
          <a
            href="https://www.marzipano.net/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Marzipano
          </a>
          ,{" "}
          <a
            href="https://www.adobe.com/products/photoshop-lightroom.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Adobe Lightroom
          </a>
          ,{" "}
          <a
            href="https://www.perplexity.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Perplexity AI
          </a>
          ,{" "}
          <a
            href="https://www.microsoft.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Microsoft Copilot
          </a>
          ,{" "}
          <a href="https://kimi.com" target="_blank" rel="noopener noreferrer">
            Kimi
          </a>
          ,{" "}
          <a
            href="https://mariushosting.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Marius Hosting
          </a>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
