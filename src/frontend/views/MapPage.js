// src/views/MapPage.js
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import LoadingErrorHandler from "../components/LoadingErrorHandler";
import { useLoadingError } from "../hooks/useLoadingError";
import { useItems } from "../hooks/useItems";
import {
  MAP_INITIAL_CENTER,
  MAP_INITIAL_ZOOM,
  ICON_URLS,
  ICON_SIZES,
} from "../constants";
import ViewerPopup from "../components/ViewerPopup";

const redPinIcon = new L.Icon({
  iconUrl: ICON_URLS.RED_MARKER,
  shadowUrl: ICON_URLS.MARKER_SHADOW,
  iconSize: ICON_SIZES.MARKER,
  iconAnchor: ICON_SIZES.MARKER_ANCHOR,
  popupAnchor: ICON_SIZES.POPUP_ANCHOR,
  shadowSize: ICON_SIZES.SHADOW,
});

// Define getBounds function (if needed for specific points)
const getBounds = (latitude, longitude) => {
  const latOffset = 0.9; // Roughly 100 km in degrees (~0.9°)
  const lngOffset = 1.5; // Roughly 100 km in degrees (~1.5°)

  return [
    [latitude - latOffset, longitude - lngOffset], // Southwest corner
    [latitude + latOffset, longitude + lngOffset], // Northeast corner
  ];
};

// Custom hook to fit bounds based on all items
const FitBounds = ({ items }) => {
  const map = useMap();

  useEffect(() => {
    if (items.length > 0) {
      const bounds = L.latLngBounds(
        items.map((item) => [item.latitude, item.longitude])
      );
      map.fitBounds(bounds);
    }
  }, [items, map]);

  return null;
};

const MapPage = () => {
  const { items, isLoading, error } = useItems();
  const { isLoading: loadingError, setErrorMessage } =
    useLoadingError(isLoading);

  // State for managing selected item and modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  if (error) {
    setErrorMessage(error);
  }

  // Function to handle marker click
  const handleMarkerClick = (item) => {
    setSelectedItem(item); // Set the selected item
    setIsModalOpen(true); // Open the modal
  };

  const handleClosePopup = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedItem(null); // Clear the selected item
  };

  return (
    <LoadingErrorHandler isLoading={loadingError} error={error}>
      <div className={styles.mapPageContainer}>
        <MapContainer
          center={MAP_INITIAL_CENTER}
          zoom={MAP_INITIAL_ZOOM}
          className={styles.leafletContainer}
          style={{ height: "100vh", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Render markers for each item */}
          {items.map((item) => (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={redPinIcon}
              eventHandlers={{
                click: () => handleMarkerClick(item), // Handle marker click to open popup
              }}
            />
          ))}

          {/* Fit bounds when items are rendered */}
          <FitBounds items={items} />
        </MapContainer>

        {/* Render ViewerPopup if an item is selected */}
        {isModalOpen && (
          <ViewerPopup
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={handleClosePopup}
          />
        )}
      </div>
    </LoadingErrorHandler>
  );
};

export default MapPage;
