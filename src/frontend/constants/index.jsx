// src/frontend/constants/index.js

// Responsive grid breakpoints for layout columns in PortfolioGrid or similar grids
export const GRID_BREAKPOINTS = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

// Initial view settings for map
export const MAP_INITIAL_CENTER = [0, 0];
export const MAP_INITIAL_ZOOM = 2;

// Backend API endpoints for fetching data
export const API_ENDPOINTS = {
  ITEMS: "/api/combined-data",
};

// Panorama viewer Field of View settings
export const PANORAMA_MAX_FOV = 110;
export const PANORAMA_MIN_FOV = 10;

export const INTRO_ANIMATION_DURATION = 6000;

// Use your own marker icons or default markers of Pigeon Maps

// Base domain for your app URLs
export const DOMAIN = "https://abstractaltitudes.com/";

const API_BASE_URL = (() => {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) throw new Error("VITE_API_URL environment variable is not set");
  return raw.replace(/\/+$/, "");
})();

export const COMBINED_DATA_URL = `${API_BASE_URL}/combined-data`;
