// src/components/HamburgerMenu.js

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/hamburger-menu.css";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          <Link to="/map" onClick={toggleMenu}>
            {" "}
            {/* Add link to Map */}
            Map
          </Link>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
