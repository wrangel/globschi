// src/frontend/views/HomePage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useItems } from "../hooks/useItems";
import styles from "../styles/Home.module.css";
import { DOMAIN } from "../constants";

const HomePage = () => {
  const navigate = useNavigate();
  const { items } = useItems();
  const [randomPano, setRandomPano] = useState(null);
  const [isPortrait, setIsPortrait] = useState(
    window.innerHeight > window.innerWidth
  );

  useEffect(() => {
    if (items.length > 0) {
      const panoItems = items.filter((item) => item.viewer === "pano");
      if (panoItems.length > 0) {
        setRandomPano(panoItems[Math.floor(Math.random() * panoItems.length)]);
      }
    }
  }, [items]);

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

      {/* Background image wrapper */}
      {randomPano && (
        <div className={styles.backgroundWrapper}>
          <img
            src={randomPano.thumbnailUrl}
            alt="Background panorama"
            draggable={false}
          />
        </div>
      )}

      <div
        className={`${styles.homePage} ${
          isPortrait ? styles.portraitLayout : ""
        }`}
      >
        <div className={styles.contentOverlay}>
          <div className={`${styles.textWrapper} ${styles.textShadow}`}>
            <h1>
              From lofty heights,
              <br />
              <span className={styles.break}>we muse on marvels</span>
            </h1>
            <h2>Abstract Altitudes</h2>
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

        <footer
          className={`${styles.credits} ${styles.contentOverlay} ${styles.textShadow}`}
        >
          <ul className={styles.creditsList}>
            <li>
              <a
                href="https://github.com/wrangel"
                target="_blank"
                rel="noopener noreferrer"
              >
                wrangel
              </a>
            </li>
            <li>
              <a
                href="https://www.dji.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                DJI
              </a>
            </li>
            <li>
              <a
                href="https://ptgui.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                PTGui Pro
              </a>
            </li>
            <li>
              <a
                href="https://www.adobe.com/products/photoshop-lightroom.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Adobe Lightroom
              </a>
            </li>
            <li>
              <a
                href="https://www.marzipano.net/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Marzipano
              </a>
            </li>
            <li>
              <a
                href="https://www.perplexity.ai/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Perplexity AI
              </a>
            </li>
            <li>
              <a
                href="https://copilot.microsoft.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Microsoft Copilot
              </a>
            </li>
            <li>
              <a
                href="https://kimi.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kimi
              </a>
            </li>
            <li>
              <a
                href="https://mariushosting.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Marius Hosting
              </a>
            </li>
          </ul>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
