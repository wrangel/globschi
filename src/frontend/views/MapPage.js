// src/views/MapPage.js
import React, { useState, useCallback, useEffect } from "react";
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

// Custom hook to fit bounds based on all items
const FitBounds = ({ items }) => {
  const map = useMap();

  useEffect(() => {
    if (items.length > 0) {
      const latitudes = items.map((item) => item.latitude);
      const longitudes = items.map((item) => item.longitude);

      // Calculate the bounding box with larger margins
      const latOffset = 1.5; // Adjust as needed for more margin
      const lngOffset = 1.5; // Adjust as needed for more margin

      const bounds = [
        [
          Math.min(...latitudes) - latOffset,
          Math.min(...longitudes) - lngOffset,
        ], // Southwest corner
        [
          Math.max(...latitudes) + latOffset,
          Math.max(...longitudes) + lngOffset,
        ], // Northeast corner
      ];

      // Fit map to bounds
      map.fitBounds(bounds);
    }
  }, [items, map]);

  return null;
};

const MapPage = () => {
  const { items, isLoading, error } = useItems();
  const { isLoading: loadingError, setErrorMessage } =
    useLoadingError(isLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error, setErrorMessage]);

  const handleMarkerClick = useCallback((item, index) => {
    setSelectedItem(item);
    setCurrentIndex(index);
    setIsModalOpen(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
  }, []);

  const handleNextItem = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setSelectedItem(items[currentIndex + 1]);
    }
  }, [currentIndex, items]);

  const handlePreviousItem = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setSelectedItem(items[currentIndex - 1]);
    }
  }, [currentIndex, items]);

  return (
    <LoadingErrorHandler isLoading={loadingError} error={error}>
      <div className={styles.mapPageContainer}>
        <MapContainer
          center={MAP_INITIAL_CENTER}
          zoom={MAP_INITIAL_ZOOM}
          className={styles.leafletContainer}
          style={{ height: "100vh", width: "100%" }}
          zoomControl={false}
          zoomSnap={0.05}
          zoomDelta={0.25}
          wheelPxPerZoomLevel={50}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          {items.map((item, index) => (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={redPinIcon}
              eventHandlers={{
                click: () => handleMarkerClick(item, index),
              }}
            />
          ))}

          <FitBounds items={items} />
        </MapContainer>

        {isModalOpen && (
          <ViewerPopup
            item={selectedItem}
            isOpen={isModalOpen}
            onClose={handleClosePopup}
            onNext={handleNextItem}
            onPrevious={handlePreviousItem}
          />
        )}
      </div>
    </LoadingErrorHandler>
  );
};

export default React.memo(MapPage);
