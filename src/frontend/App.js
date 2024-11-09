// src/App.js

import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import HamburgerMenu from "./components/HamburgerMenu";

// Lazy load the Home, About, and Map components
const Home = React.lazy(() => import("./views/Home"));
const About = React.lazy(() => import("./views/About"));
const Map = React.lazy(() => import("./views/Map"));

function App() {
  return (
    <Router>
      <div className="App">
        <HamburgerMenu /> {/* Render the Hamburger Menu */}
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/map" element={<Map />} />
              {/* PanoPage route removed */}
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default React.memo(App);
