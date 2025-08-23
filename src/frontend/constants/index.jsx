// src/frontend/constants/index.js

import L from "leaflet"; // Import Leaflet library for map functionality

// Responsive grid breakpoints for layout columns in PortfolioGrid or similar grids
export const GRID_BREAKPOINTS = {
  default: 4, // 4 columns for larger screens
  1100: 3, // 3 columns for screen widths <= 1100px
  700: 2, // 2 columns for screen widths <= 700px
  500: 1, // 1 column for screen widths <= 500px (mobile)
};

// Initial view settings for Leaflet map
export const MAP_INITIAL_CENTER = [0, 0]; // Latitude and longitude center of the map
export const MAP_INITIAL_ZOOM = 2; // Initial zoom level (world view)

// Backend API endpoints for fetching data
export const API_ENDPOINTS = {
  ITEMS: "/api/combined-data", // Endpoint to fetch combined portfolio or data items
};

// Panorama viewer Field of View settings
export const PANORAMA_MAX_FOV = 110; // Maximum Field of View in degrees
export const PANORAMA_MIN_FOV = 10; // Minimum Field of View in degrees

// Intro animation duration in milliseconds (e.g., start-up or splash animation)
export const INTRO_ANIMATION_DURATION = 6000;

// URLs for map marker icons used in Leaflet maps
export const ICON_URLS = {
  RED_MARKER:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  MARKER_SHADOW:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
};

// Sizes for Leaflet map icons and their anchors
export const ICON_SIZES = {
  MARKER: [25, 41], // Marker icon size
  MARKER_ANCHOR: [12, 41], // Point of the icon which will correspond to marker's location
  POPUP_ANCHOR: [1, -34], // Where the popup should open relative to icon anchor
  SHADOW: [41, 41], // Shadow image size
};

// Define the redPinIcon using Leaflet's Icon class, applying URLs and sizes
const redPinIcon = new L.Icon({
  iconUrl: ICON_URLS.RED_MARKER,
  shadowUrl: ICON_URLS.MARKER_SHADOW,
  iconSize: ICON_SIZES.MARKER,
  iconAnchor: ICON_SIZES.MARKER_ANCHOR,
  popupAnchor: ICON_SIZES.POPUP_ANCHOR,
  shadowSize: ICON_SIZES.SHADOW,
});

// The base domain for the app; trailing slash ensured for consistency with URLs
export const DOMAIN = "https://abstractaltitudes.com/";
