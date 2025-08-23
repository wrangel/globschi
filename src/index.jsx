// src/index.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // React Router for client-side routing
import App from "./frontend/App";
import reportWebVitals from "./frontend/reportWebVitals";
import "./frontend/styles/Global.css"; // Global styles

// Create root React 18 container for the app
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the app component wrapped in BrowserRouter for routing support
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

// Optional: Measure and log web vitals for performance monitoring
// Pass a function to log or send these results to analytics
// See https://bit.ly/CRA-vitals for more info
reportWebVitals(console.log);
