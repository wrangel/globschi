// src/components/HamburgerMenu.js
import React, { useState, memo } from "react";
import PropTypes from "prop-types";
import styles from "../styles/HamburgerMenu.module.css";

const HamburgerMenu = memo(({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    onNavigate(path); // Call the passed in function
    setIsOpen(false); // Close the menu after navigation
  };

  return (
    <div className={styles.hamburgerMenu}>
      <button
        onClick={handleToggle}
        className={styles.menuIcon}
        aria-label="Toggle Menu"
      >
        &#9776; {/* Hamburger icon */}
      </button>
      {isOpen && (
        <div className={styles.menuDropdown}>
          <button onClick={() => handleNavigation("/")}>Home</button>
          <button onClick={() => handleNavigation("/about")}>About</button>
          <button onClick={() => handleNavigation("/map")}>Map</button>
        </div>
      )}
    </div>
  );
});

// Prop Types for validation
HamburgerMenu.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};

export default HamburgerMenu;
