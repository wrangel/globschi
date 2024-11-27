// src/App.js

import React, { Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary"; // Import ErrorBoundary
import Fab from "./components/Fab"; // Import the Fab component

// Lazy load the components
const HomePage = React.lazy(() => import("./views/HomePage"));
const GridPage = React.lazy(() => import("./views/GridPage"));
const MapPage = React.lazy(() => import("./views/MapPage"));
const AboutPage = React.lazy(() => import("./views/AboutPage"));

function App() {
  const navigate = useNavigate();

  return (
    <div className="App">
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/grid" element={<GridPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Fab onNavigate={navigate} /> {/* Add the FAB here */}
    </div>
  );
}

export default React.memo(App);
