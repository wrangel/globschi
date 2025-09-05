// src/frontend/App.jsx

import "./styles/Global.css";
import React, { Suspense, lazy } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import NavigationPages from "./components/NavigationPages";
import LoadingOverlay from "./components/LoadingOverlay";

import useSWR, { preload } from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Preload items early on app start
preload("http://localhost:8081/api/combined-data", fetcher);

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
              <Route path="/map" element={<MapPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <NavigationPages onNavigate={navigate} />
      </div>
    </HelmetProvider>
  );
}

export default React.memo(App);
