// src/frontend/views/HomePage.js

import React from "react";
import styles from "../styles/Home.module.css"; // Adjust the path if necessary

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <img src="/globschi.jpg" alt="Globschi" className={styles.image} />{" "}
      {/* Use the image */}
      <h1>Marvels From Above</h1>
    </div>
  );
};

export default HomePage;
