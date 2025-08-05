// src/index.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // Import BrowserRouter
import App from "./frontend/App";
import reportWebVitals from "./frontend/reportWebVitals";
import "./frontend/styles/Global.css";
import "@photo-sphere-viewer/core/index.css";

// Initialize the root element with React 18's createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the App component wrapped in Router
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

// Performance measurement setup
// If you want to start measuring performance in your app, pass a function
// to log results (for example: console.log) or send to an analytics endpoint.
// Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
