// src/frontend/constants/index.js

import L from "leaflet"; // Import Leaflet

// Grid breakpoints
export const GRID_BREAKPOINTS = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

// Map settings
export const MAP_INITIAL_CENTER = [0, 0];
export const MAP_INITIAL_ZOOM = 2;

// API endpoints
export const API_ENDPOINTS = {
  ITEMS: "/api/combined-data",
};

// Viewer settings
export const PANORAMA_MAX_FOV = 110;
export const PANORAMA_MIN_FOV = 10;

// Animation durations
export const INTRO_ANIMATION_DURATION = 6000; // in milliseconds

// Icon URLs
export const ICON_URLS = {
  RED_MARKER:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  MARKER_SHADOW:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
};

// Icon sizes
export const ICON_SIZES = {
  MARKER: [25, 41],
  MARKER_ANCHOR: [12, 41],
  POPUP_ANCHOR: [1, -34],
  SHADOW: [41, 41],
};

// Define redPinIcon
export const redPinIcon = new L.Icon({
  iconUrl: ICON_URLS.RED_MARKER,
  shadowUrl: ICON_URLS.MARKER_SHADOW,
  iconSize: ICON_SIZES.MARKER,
  iconAnchor: ICON_SIZES.MARKER_ANCHOR,
  popupAnchor: ICON_SIZES.POPUP_ANCHOR,
  shadowSize: ICON_SIZES.SHADOW,
});

// Domain
export const DOMAIN = "https://abstractaltitudes.com/"; // Ensure trailing slash: This avoids issues where some tools or search engines might treat URLs with and without a trailing slash as different.
