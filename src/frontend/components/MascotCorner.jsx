// src/frontend/components/MascotCorner.jsx

import { Link, useLocation } from "react-router-dom";
import styles from "../styles/MascotCorner.module.css";
import mascotImage from "../assets/mascot.png";

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
      <img
        src={mascotImage}
        alt="Corporate mascot"
        className={styles.mascotCorner}
        draggable={false}
      />
    </Link>
  );
}
