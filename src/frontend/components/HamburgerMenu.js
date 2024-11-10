// src/components/HamburgerMenu.js

import React, { memo } from "react";
import PropTypes from "prop-types"; // Ensure PropTypes is imported
import styles from "../styles/HamburgerMenu.module.css";

const HamburgerMenu = memo(({ isOpen, onToggle, onNavigate }) => {
  // If not open, do not render anything
  if (!isOpen) return null;

  return (
    <div className={styles.hamburgerMenu}>
      <button
        onClick={onToggle}
        className={styles.menuIcon}
        aria-label="Toggle Menu"
      >
        &#9776; {/* Hamburger icon */}
      </button>
      <div className={styles.menuDropdown}>
        <button onClick={() => onNavigate("/")}>Home</button>
        <button onClick={() => onNavigate("/about")}>About</button>
        <button onClick={() => onNavigate("/map")}>Map</button>
      </div>
    </div>
  );
});

// Prop Types for validation
HamburgerMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default HamburgerMenu;
