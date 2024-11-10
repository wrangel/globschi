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
import styles from "./styles/SharedStyles.module.css";

// Lazy load the Home, About, and Map components
const Home = React.lazy(() => import("./views/Home"));
const About = React.lazy(() => import("./views/About"));
const Map = React.lazy(() => import("./views/Map"));

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.app}>
      <HamburgerMenu
        isOpen={isMenuOpen}
        onToggle={toggleMenu}
        onNavigate={handleNavigate}
      />
      <ErrorBoundary>
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
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
