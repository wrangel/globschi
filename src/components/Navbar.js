// src/components/Navbar.js

import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "../styles/navbar.css"; // Create a CSS file for styles

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
