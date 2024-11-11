// src/views/MapPage.js
import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
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

// Define the red pin icon
const redPinIcon = new L.Icon({
  iconUrl: ICON_URLS.RED_MARKER,
  shadowUrl: ICON_URLS.MARKER_SHADOW,
  iconSize: ICON_SIZES.MARKER,
  iconAnchor: ICON_SIZES.MARKER_ANCHOR,
  popupAnchor: ICON_SIZES.POPUP_ANCHOR,
  shadowSize: ICON_SIZES.SHADOW,
});

const MapPage = () => {
  const { items, isLoading, error } = useItems();
  const { isLoading: loadingError, setErrorMessage } =
    useLoadingError(isLoading);

  if (error) {
    setErrorMessage(error);
  }

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
                click: () => {
                  // Handle marker click to show popup or any other action
                },
              }}
            />
          ))}
        </MapContainer>

        {/* Render ViewerPopup if an item is selected */}
        {/* Add logic for handling selected item and showing popup */}
      </div>
    </LoadingErrorHandler>
  );
};

export default MapPage;
