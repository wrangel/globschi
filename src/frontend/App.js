// src/App.js

import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import HamburgerMenu from "./components/HamburgerMenu";
import "./styles/global.css";

// Lazy load the HomePage, About, and MapPage components
const HomePage = React.lazy(() => import("./views/HomePage"));
const AboutPage = React.lazy(() => import("./views/About"));
const MapPage = React.lazy(() => import("./views/MapPage"));

function App() {
  return (
    <Router>
      <div className="App">
        <HamburgerMenu /> {/* Render the Hamburger Menu */}
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/map" element={<MapPage />} />
              {/* PanoPage route removed */}
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default React.memo(App);
