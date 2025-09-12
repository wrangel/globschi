// src/frontend/components/NavigationPages.jsx

import { useLocation } from "react-router-dom";
import styles from "../styles/Navigation.module.css";

/**
 * Floating Action Button (NavigationPages) component providing navigation links.
 *
 * Displays a set of navigation buttons based on the current URL path.
 * Buttons highlight the active path and call onNavigate callback when clicked.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.onNavigate - Callback invoked with the new path on button click.
 */
const NavigationPages = ({ onNavigate }) => {
  const location = useLocation();

  // Define button configurations for different routes without "Home"
  const buttonConfig = {
    "/": [
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
    ],
    "/grid": [
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
    ],
    "/map": [
      { label: "Map", path: "/map" },
      { label: "Grid", path: "/grid" },
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
        type="button"
      >
        {button.label}
      </button>
    ));
  };

  return (
    <nav
      className={styles.fabContainer}
      style={{ zIndex: 950 }}
      aria-label="Page navigation"
      role="navigation"
    >
      <div className={styles.fabMenu}>{renderButtons()}</div>
    </nav>
  );
};

export default NavigationPages;
