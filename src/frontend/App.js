import React, { Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import HamburgerMenu from "./components/HamburgerMenu";

// Lazy load the components
const HomePage = React.lazy(() => import("./views/HomePage")); // New home page
const GridPage = React.lazy(() => import("./views/GridPage")); // Updated grid page
const MapPage = React.lazy(() => import("./views/MapPage"));
const AboutPage = React.lazy(() => import("./views/AboutPage"));

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <HamburgerMenu onNavigate={navigate} />
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} /> {/* New home page */}
            <Route path="/grid" element={<GridPage />} /> {/* Updated route */}
            <Route path="/map" element={<MapPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default React.memo(App);
