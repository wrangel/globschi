// src/frontend/components/Fab.js

import { useLocation } from "react-router-dom";
import styles from "../styles/Fab.module.css";

const Fab = ({ onNavigate }) => {
  const location = useLocation();

  // Define the button configurations based on the current location
  const buttonConfig = {
    "/": [
      { label: "About", path: "/about" },
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
      { label: "Home", path: "/" },
    ],
    "/grid": [
      { label: "About", path: "/about" },
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
      { label: "Home", path: "/" },
    ],
    "/map": [
      { label: "About", path: "/about" },
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
      { label: "Home", path: "/" },
    ],
    "/about": [
      { label: "About", path: "/about" },
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
      { label: "Home", path: "/" },
    ],
  };

  const renderButtons = () => {
    const buttons = buttonConfig[location.pathname] || [];

    return buttons.map((button) => (
      <button
        key={button.path}
        className={`${styles.fab} ${
          location.pathname === button.path ? styles.active : ""
        }`}
        onClick={() => onNavigate(button.path)}
        aria-label={`Go to ${button.label}`}
      >
        {button.label}
      </button>
    ));
  };

  return (
    <div className={styles.fabContainer} style={{ zIndex: 950 }}>
      <div className={styles.fabMenu}>{renderButtons()}</div>
    </div>
  );
};

export default Fab;
