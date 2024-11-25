// src/frontend/views/HomePage.js

import React from "react";
import styles from "../styles/Home.module.css"; // Adjust the path if necessary

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <img src="/globschi.jpg" alt="Globschi" className={styles.image} />{" "}
      {/* Use the image */}
      <h1>Welcome to Marvels From Above</h1>
      <h2>Your view from the air</h2>
    </div>
  );
};

export default HomePage;
