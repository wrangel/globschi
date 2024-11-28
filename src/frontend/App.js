// src/frontend/App.js

import React, { Suspense, lazy } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Fab from "./components/Fab";

// Lazy load the components
const HomePage = lazy(() => import("./views/HomePage"));
const GridPage = lazy(() => import("./views/GridPage"));
const MapPage = lazy(() => import("./views/MapPage"));
const AboutPage = lazy(() => import("./views/AboutPage"));

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
      <Fab onNavigate={navigate} />
    </div>
  );
}

export default React.memo(App);
