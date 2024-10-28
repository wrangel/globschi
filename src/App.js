// src/App.js
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import Routes instead of Switch
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar"; // Import the Navbar component
import "./styles/main.css";

// Lazy load the HomePage and About components
const HomePage = React.lazy(() => import("./views/HomePage"));
const AboutPage = React.lazy(() => import("./views/About")); // Adjust the path as needed

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Render the Navbar */}
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {" "}
              {/* Use Routes instead of Switch */}
              <Route path="/about" element={<AboutPage />} />{" "}
              {/* Route for About page */}
              <Route path="/" element={<HomePage />} />{" "}
              {/* Route for Home page */}
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default React.memo(App);
