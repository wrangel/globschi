// src/frontend/components/NavigationPages.jsx

import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import styles from "../styles/Navigation.module.css";

/**
 * Navigation Floating Action Button (NavigationPages).
 *
 * Shows buttons to navigate between Map, Grid, and Home routes.
 * Highlights the active route's button.
 *
 * @param {Object} props
 * @param {(path: string) => void} props.onNavigate Callback invoked on button click.
 */
const BUTTONS = [
  { label: "Map", path: "/map" },
  { label: "Grid", path: "/grid" },
  { label: "Home", path: "/" },
];

function NavigationPages({ onNavigate }) {
  const { pathname } = useLocation();

  return (
    <div className={styles.fabContainer} style={{ zIndex: 950 }}>
      <div className={styles.fabMenu}>
        {BUTTONS.map(({ label, path }) => (
          <button
            key={path}
            className={`${styles.fab} ${
              pathname === path ? styles.active : ""
            }`}
            onClick={() => onNavigate(path)}
            aria-label={`Go to ${label}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

NavigationPages.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};

export default NavigationPages;
