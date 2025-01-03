// src/frontend/views/HomePage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import GlobeButton from "../components/GlobeButton";
import styles from "../styles/Home.module.css";
import fabStyles from "../styles/Fab.module.css";
import { DOMAIN } from "../constants";
import { ReactComponent as ArrowIcon } from "../assets/arrow.svg";

const HomePage = () => {
  const navigate = useNavigate();
  const [isPortrait, setIsPortrait] = useState(
    window.innerHeight > window.innerWidth
  );

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

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
        <title>Abstract Altitudes - Drone-borne Aerial Imagery</title>
        <link rel="canonical" href={DOMAIN} />
        <meta
          name="description"
          content="Explore drone-captured aerial imagery. From lofty heights, we muse on marvels."
        />
        <meta
          property="og:title"
          content="Abstract Altitudes - Drone-borne Aerial Imagery"
        />
        <meta
          property="og:description"
          content="Explore drone-captured aerial imagery. From lofty heights, we muse on marvels."
        />
        <meta property="og:image" content={`${DOMAIN}/globschi.jpg`} />
        <meta property="og:url" content={DOMAIN} />
        <meta property="og:type" content="website" />
        <meta name="x:card" content="summary_large_image" />
        <meta
          name="x:title"
          content="Abstract Altitudes - Drone-borne Aerial Imagery"
        />
        <meta
          name="x:description"
          content="Explore drone-captured aerial imagery. From lofty heights, we muse on marvels."
        />
        <meta name="x:image" content={`${DOMAIN}/globschi.jpg`} />
      </Helmet>
      <div
        className={`${styles.homePage} ${
          isPortrait ? styles.portraitLayout : ""
        }`}
      >
        <div className={styles.textWrapper}>
          <h1>
            From lofty heights,
            <br />
            <span className={styles.break}>we muse on marvels</span>
          </h1>
          <h2>Drone-borne aerial imagery</h2>
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
        <div className={styles.helpContainer}>
          <div className={styles.helpText}>
            If you find yourself in a panorama popup: Click on the globe to
            explore every nook and cranny. Click again to move on to the next
            adventure! 🚀
          </div>
          <ArrowIcon className={styles.arrow} />
        </div>
        <div className={styles.globeButtonContainer}>
          <GlobeButton className={fabStyles.fabNoHover} />
        </div>
      </div>
    </>
  );
};

export default HomePage;
