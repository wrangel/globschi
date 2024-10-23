// src/App.js
import React, { Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/main.css";

// Lazy load the HomePage component
const HomePage = React.lazy(() => import("./views/HomePage"));

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <HomePage />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default React.memo(App);
