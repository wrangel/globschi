// src/App.js

import React, { useState, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import HamburgerMenu from "./components/HamburgerMenu";

// Lazy load the Home, About, and Map components
const Home = React.lazy(() => import("./views/Home"));
const About = React.lazy(() => import("./views/About"));
const Map = React.lazy(() => import("./views/Map"));

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev); // Toggle menu open/close
  };

  const navigate = useNavigate(); // Get the navigate function from the hook

  const handleNavigate = (path) => {
    navigate(path); // Use navigate function to change routes
    setIsMenuOpen(false); // Close menu after navigation
  };

  return (
    <div className="App">
      <HamburgerMenu
        isOpen={isMenuOpen}
        onToggle={toggleMenu}
        onNavigate={handleNavigate} // Pass the handleNavigate function
      />
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/map" element={<Map />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// Wrap App in Router to use useNavigate
const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default React.memo(AppWithRouter);
