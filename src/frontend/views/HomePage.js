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
          Marvels From <span className={styles.break}>Above</span>
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
