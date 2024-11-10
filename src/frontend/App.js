// src/App.js

import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import HamburgerMenu from "./components/HamburgerMenu";

// Lazy load the HomePage, AboutPage, MapPage, and PanoPage components
const HomePage = React.lazy(() => import("./views/Home"));
const AboutPage = React.lazy(() => import("./views/About"));
const MapPage = React.lazy(() => import("./views/Map"));

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <HamburgerMenu onNavigate={navigate} /> {/* Render the Hamburger Menu */}
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default React.memo(App);
