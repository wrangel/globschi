// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./styles/main.css";

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
