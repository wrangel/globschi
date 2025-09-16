// src/frontend/components/MascotCorner.jsx

import { Link, useLocation } from "react-router-dom";
import LazyImage from "./LazyImage";
import mascotImage from "../assets/mascot.png";
import styles from "../styles/MascotCorner.module.css";

export default function MascotCorner() {
  const location = useLocation();

  // Hide mascot corner on homepage path "/"
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
        placeholderSrc="" // Optionally add a placeholder image URL here
      />
    </Link>
  );
}
