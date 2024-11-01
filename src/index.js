// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./styles/main.css";
import "./styles/global.css";
import "./styles/home.css";
import "./styles/error-boundary.css";
import "./styles/image-popup.css";
import "./styles/portfolio-grid.css";
import "./styles/portfolio-item.css";
import "@photo-sphere-viewer/core/index.css";

// Initialize the root element with React 18's createRoot
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the App component wrapped in StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance measurement setup
// If you want to start measuring performance in your app, pass a function
// to log results (for example: console.log) or send to an analytics endpoint.
// Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
