// src/frontend/views/HomePage.js

import React from "react";
import { useNavigate } from "react-router-dom";
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
    </div>
  );
};

export default HomePage;
