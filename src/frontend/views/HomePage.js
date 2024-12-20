// src/frontend/views/HomePage.js

import React from "react";
import { useNavigate } from "react-router-dom";
import GlobeButton from "../components/GlobeButton";
import styles from "../styles/Home.module.css";
import fabStyles from "../styles/Fab.module.css";
import { ReactComponent as ArrowIcon } from "../../assets/arrow.svg";

const HomePage = () => {
  const navigate = useNavigate();

  const handleImageClick = () => {
    const randomPage = Math.random() < 0.5 ? "/grid" : "/map";
    navigate(randomPage);
  };

  return (
    <div className={styles.homePage}>
      <div className={styles.textWrapper}>
        <h1>
          From lofty heights,
          <br />
          <span className={styles.break}>we muse on marvels</span>
        </h1>
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
          If you find yourself in a panorama popup, get ready to dive into a
          world of wonders! Click on the globe to explore every nook and cranny.
          Click again for the next adventure! 🚀
        </div>
        <ArrowIcon className={styles.arrow} />
      </div>
      <div className={styles.globeButtonContainer}>
        <GlobeButton className={fabStyles.fabNoHover} />
      </div>
    </div>
  );
};

export default HomePage;
