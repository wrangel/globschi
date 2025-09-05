// src/frontend/components/Fab1.jsx

import { useLocation } from "react-router-dom";
import styles from "../styles/Fab.module.css";

/**
 * Floating Action Button (Fab1) component providing navigation links.
 *
 * Displays a set of navigation buttons based on the current URL path.
 * Buttons highlight the active path and call onNavigate callback when clicked.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onNavigate - Callback invoked with the new path on button click.
 */
const Fab1 = ({ onNavigate }) => {
  const location = useLocation();

  // Define button configurations for different routes.
  // Here the same list is used for all specified paths.
  const buttonConfig = {
    "/": [
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
      { label: "Home", path: "/" },
    ],
    "/grid": [
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
      { label: "Home", path: "/" },
    ],
    "/map": [
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
      { label: "Home", path: "/" },
    ],
  };

  /**
   * Render navigation buttons corresponding to the current route.
   * Highlights the active route button.
   */
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

export default Fab1;
