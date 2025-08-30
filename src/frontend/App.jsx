// src/frontend/App.jsx

import React, { Suspense, lazy } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; // Add this import
import ErrorBoundary from "./components/ErrorBoundary";
import Fab from "./components/Fab";
import LoadingOverlay from "./components/LoadingOverlay";

// Lazy load the components
const HomePage = lazy(() => import("./views/HomePage"));
const GridPage = lazy(() => import("./views/GridPage"));
const MapPage = lazy(() => import("./views/MapPage"));

function App() {
  const navigate = useNavigate();

  return (
    <HelmetProvider>
      <div className="App">
        <ErrorBoundary>
          <Suspense fallback={<LoadingOverlay />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/grid" element={<GridPage />} />
              <Route path="/map" element={<MapPage />} /> {}
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Fab onNavigate={navigate} />
      </div>
    </HelmetProvider>
  );
}

export default React.memo(App);
