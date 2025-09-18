// src/frontend/components/MascotCorner.jsx

import React, { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import LazyImage from "./LazyImage";
import mascotImage from "../assets/mascot.png";
import styles from "../styles/MascotCorner.module.css";

const MascotCorner = () => {
  const location = useLocation();
  if (location.pathname === "/") {
    return null;
  }

  return (
    <Link
      to="/"
      aria-label="Go to homepage"
      className={styles.mascotCornerLink}
    >
      <LazyImage
        src={mascotImage}
        alt="Corporate mascot"
        className={styles.mascotCorner}
        draggable={false}
        placeholderSrc=""
      />
    </Link>
  );
};

export default memo(MascotCorner);
