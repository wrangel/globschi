// src/frontend/App.jsx

import "./styles/Global.css";
import React, { Suspense, lazy } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { preload } from "swr";

import ErrorBoundary from "./components/ErrorBoundary";
import NavigationPages from "./components/NavigationPages";
import LoadingOverlay from "./components/LoadingOverlay";
import { COMBINED_DATA_URL } from "./constants"; // <-- NEW

const fetcher = (url) => fetch(url).then((res) => res.json());

// Pre-load the endpoint once the env-var has been validated
preload(COMBINED_DATA_URL, fetcher);

// Lazy-loaded views
const Home = lazy(() => import("./views/Home"));
const Grid = lazy(() => import("./views/Grid"));
const Map = lazy(() => import("./views/Map"));

function App() {
  const navigate = useNavigate();

  return (
    <HelmetProvider>
      <div className="App">
        <ErrorBoundary>
          <Suspense fallback={<LoadingOverlay />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/grid" element={<Grid />} />
              <Route path="/map" element={<Map />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <NavigationPages onNavigate={navigate} />
      </div>
    </HelmetProvider>
  );
}

export default React.memo(App);
