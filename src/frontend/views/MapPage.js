// src/frontend/views/MapPage.js

import React, { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import LoadingErrorHandler from "../components/LoadingErrorHandler";
import ViewerPopup from "../components/ViewerPopup";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import { useLoadingError } from "../hooks/useLoadingError";
import {
  MAP_INITIAL_CENTER,
  MAP_INITIAL_ZOOM,
  ICON_URLS,
  DOMAIN,
} from "../constants";
import styles from "../styles/Map.module.css";

// Google Maps API key from .env
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Helper: calculate bounds for all markers
function getLatLngBounds(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;
  items.forEach(({ latitude, longitude }) => {
    if (typeof latitude === "number" && typeof longitude === "number") {
      minLat = Math.min(minLat, latitude);
      maxLat = Math.max(maxLat, latitude);
      minLng = Math.min(minLng, longitude);
      maxLng = Math.max(maxLng, longitude);
    }
  });
  if (
    isFinite(minLat) &&
    isFinite(maxLat) &&
    isFinite(minLng) &&
    isFinite(maxLng) &&
    minLat < maxLat &&
    minLng < maxLng
  ) {
    // Add a small offset for padding
    const latOffset = 0.5,
      lngOffset = 0.5;
    return {
      south: minLat - latOffset,
      west: minLng - lngOffset,
      north: maxLat + latOffset,
      east: maxLng + lngOffset,
    };
  }
  return null;
}

const MapPage = () => {
  const { items, isLoading: isItemsLoading, error: itemsError } = useItems();
  const { isLoading, error, setErrorMessage, stopLoading } =
    useLoadingError(true);
  const {
    selectedItem,
    isModalOpen,
    handleItemClick,
    handleClosePopup,
    handleNextItem,
    handlePreviousItem,
  } = useItemViewer(items);

  // Ref to the map instance for fitBounds
  const mapRef = useRef(null);

  // Fit bounds when items change
  useEffect(() => {
    if (mapRef.current && Array.isArray(items) && items.length > 0) {
      const bounds = getLatLngBounds(items);
      if (bounds) {
        // Google Maps API: fitBounds expects a LatLngBoundsLiteral
        mapRef.current.fitBounds({
          north: bounds.north,
          south: bounds.south,
          east: bounds.east,
          west: bounds.west,
        });
      }
    }
  }, [items]);

  useEffect(() => {
    if (!isItemsLoading) stopLoading();
    if (itemsError) setErrorMessage(itemsError);
  }, [isItemsLoading, itemsError, stopLoading, setErrorMessage]);

  return (
    <>
      <Helmet>
        <link rel="canonical" href={`${DOMAIN}map`} />
        <title>Abstract Altitudes - Interactive Drone Imagery Map</title>
        <meta
          name="description"
          content="Explore our interactive map showcasing stunning drone-captured aerial images from various locations. Discover breathtaking views and unique perspectives from above."
        />
      </Helmet>
      <LoadingErrorHandler isLoading={isLoading} error={error}>
        <div className={styles.mapPageContainer}>
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              ref={mapRef}
              style={{ height: "100vh", width: "100%" }}
              defaultCenter={{
                lat: MAP_INITIAL_CENTER[0],
                lng: MAP_INITIAL_CENTER[1],
              }}
              defaultZoom={MAP_INITIAL_ZOOM}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapId={process.env.REACT_APP_GOOGLE_MAP_ID} // Optional: for custom styling
              onLoad={(mapInstance) => {
                mapRef.current = mapInstance;
              }}
            >
              {items.map((item) => (
                <Marker
                  key={item.id}
                  position={{ lat: item.latitude, lng: item.longitude }}
                  icon={{
                    url: ICON_URLS.RED_MARKER, // Your red pin icon URL
                    scaledSize: { width: 32, height: 32 }, // adjust as needed
                  }}
                  onClick={() => handleItemClick(item)}
                />
              ))}
              {/* InfoWindow or popup logic can go here if needed */}
            </Map>
          </APIProvider>
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
    </>
  );
};

export default React.memo(MapPage);
