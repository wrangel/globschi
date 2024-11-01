// src/App.js
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import Router components
import ErrorBoundary from "./components/ErrorBoundary";
import HamburgerMenu from "./components/HamburgerMenu"; // Import the Hamburger Menu component
import "./styles/global.css";

// Lazy load the HomePage and About components
const HomePage = React.lazy(() => import("./views/HomePage"));
const AboutPage = React.lazy(() => import("./views/About")); // Adjust the path as needed

function App() {
  return (
    <Router>
      <div className="App">
        <HamburgerMenu /> {/* Render the Hamburger Menu */}
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/about" element={<AboutPage />} />
              <Route path="/" element={<HomePage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default React.memo(App);
