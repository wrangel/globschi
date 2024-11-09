// src/components/HamburgerMenu.js

import React from "react";
import PropTypes from "prop-types"; // Ensure PropTypes is imported
import styles from "../styles/HamburgerMenu.module.css";

const HamburgerMenu = React.memo(({ isOpen, onToggle, onNavigate }) => {
  return (
    <div className={styles.hamburgerMenu}>
      {" "}
      {/* Use styles from the module */}
      <button
        onClick={onToggle}
        className={styles.menuIcon}
        aria-label="Toggle Menu"
      >
        &#9776; {/* Hamburger icon */}
      </button>
      {isOpen && (
        <div className={styles.menuDropdown}>
          <button onClick={() => onNavigate("/")}>Home</button>
          <button onClick={() => onNavigate("/about")}>About</button>
          <button onClick={() => onNavigate("/map")}>Map</button>
        </div>
      )}
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
