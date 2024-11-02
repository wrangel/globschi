// src/components/HamburgerMenu.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/hamburger-menu.css"; // Import your CSS

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false); // State to manage menu visibility
  const navigate = useNavigate(); // Hook for navigation

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="hamburger-menu">
      <button onClick={toggleMenu} className="menu-icon">
        &#9776; {/* Hamburger icon */}
      </button>
      {isOpen && (
        <div className="menu-dropdown">
          <button onClick={() => handleNavigation("/")}>Home</button>
          <button onClick={() => handleNavigation("/about")}>About</button>
          <button onClick={() => handleNavigation("/map")}>Map</button>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
