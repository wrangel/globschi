// src/components/HamburgerMenu.js

import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "../styles/hamburger-menu.css"; // Import your CSS

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
          <Link to="/" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setIsOpen(false)}>
            About
          </Link>
          <Link to="/map" onClick={() => setIsOpen(false)}>
            Map
          </Link>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
