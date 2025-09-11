// src/frontend/views/HomePage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useItems } from "../hooks/useItems";
import styles from "../styles/Home.module.css";
import { DOMAIN } from "../constants";
import mascotImage from "../assets/mascot.png";

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
        <title>Abstract Altitudes</title>
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
              src={mascotImage} //
              alt="Abstract Altitudes Mascot"
              className={styles.image}
              onClick={handleImageClick}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>

        <footer className={styles.credits}>
          <div className={`${styles.contentOverlay} ${styles.textShadow}`}>
            <ul className={styles.creditsList}>
              {[
                { href: "https://github.com/wrangel ", label: "wrangel" },
                { href: "https://www.dji.com ", label: "DJI" },
                { href: "https://ptgui.com ", label: "PTGui Pro" },
                {
                  href: "https://www.adobe.com/products/photoshop-lightroom.html ",
                  label: "Adobe Lightroom",
                },
                { href: "https://www.marzipano.net/ ", label: "Marzipano" },
                { href: "https://www.perplexity.ai/ ", label: "Perplexity AI" },
                {
                  href: "https://copilot.microsoft.com/ ",
                  label: "Microsoft Copilot",
                },
                { href: "https://kimi.com ", label: "Kimi" },
                {
                  href: "https://mariushosting.com/ ",
                  label: "Marius Hosting",
                },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
