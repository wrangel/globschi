// src/frontend/components/MascotCorner.jsx

import styles from "../styles/MascotCorner.module.css";
import mascotImage from "../assets/mascot.png";

export default function MascotCorner() {
  return (
    <img
      src={mascotImage}
      alt="Corporate mascot"
      className={styles.mascotCorner}
      draggable={false}
    />
  );
}
