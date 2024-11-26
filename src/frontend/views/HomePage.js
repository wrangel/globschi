// src/frontend/views/HomePage.js

import React from "react";
import styles from "../styles/Home.module.css"; // Adjust the path if necessary

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <div className={styles.textWrapper}>
        <h1>Marvels From Above</h1>
      </div>
      <div className={styles.imageWrapper}>
        <img src="/globschi.jpg" alt="Globschi" className={styles.image} />
      </div>
    </div>
  );
};

export default HomePage;
