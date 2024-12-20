import React from "react";
import { useNavigate } from "react-router-dom";
import GlobeButton from "../components/GlobeButton";
import styles from "../styles/Home.module.css";

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
          Click to explore the view. Thenlick again for the next adventure! 🚀
        </div>
        <div className={styles.arrow}></div>
      </div>
      <div className={styles.globeButtonContainer}>
        <GlobeButton />
      </div>
    </div>
  );
};

export default HomePage;
