// src/components/HamburgerMenu.js
import React from "react";
import PropTypes from "prop-types"; // Ensure PropTypes is imported

const HamburgerMenu = React.memo(({ isOpen, onToggle, onNavigate }) => {
  return (
    <div className="hamburger-menu">
      <button onClick={onToggle} className="menu-icon" aria-label="Toggle Menu">
        &#9776; {/* Hamburger icon */}
      </button>
      {isOpen && (
        <div className="menu-dropdown">
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
