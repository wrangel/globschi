// src/components/HamburgerMenu.js

import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "../styles/hamburgerMenu.css"; // Create a CSS file for styles

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false); // State to manage menu visibility

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="hamburger-menu">
      <button onClick={toggleMenu} className="menu-icon">
        &#9776; {/* Hamburger icon */}
      </button>
      {isOpen && (
        <div className="menu-dropdown">
          <Link to="/" onClick={toggleMenu}>
            Home
          </Link>
          <Link to="/about" onClick={toggleMenu}>
            About
          </Link>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
