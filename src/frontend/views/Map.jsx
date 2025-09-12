// src/frontend/views/Map.js

import React, { useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LoadingErrorHandler from "../components/LoadingErrorHandler";
import ViewerPopup from "../components/ViewerPopup";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import { useLoadingError } from "../hooks/useLoadingError";
import {
  MAP_INITIAL_CENTER,
  MAP_INITIAL_ZOOM,
  ICON_URLS,
  ICON_SIZES,
  DOMAIN,
} from "../constants";
import styles from "../styles/Map.module.css";

const redPinIcon = new L.Icon({
  iconUrl: ICON_URLS.RED_MARKER,
  shadowUrl: ICON_URLS.MARKER_SHADOW,
  iconSize: ICON_SIZES.MARKER,
  iconAnchor: ICON_SIZES.MARKER_ANCHOR,
  popupAnchor: ICON_SIZES.POPUP_ANCHOR,
  shadowSize: ICON_SIZES.SHADOW,
});

const FitBounds = ({ items }) => {
  const map = useMap();

  useEffect(() => {
    if (items.length > 0) {
      const latitudes = items.map((item) => item.latitude);
      const longitudes = items.map((item) => item.longitude);

      // Adjust offsets for tighter fit
      const latOffset = 0.5;
      const lngOffset = 0.5;

      const bounds = [
        [
          Math.min(...latitudes) - latOffset,
          Math.min(...longitudes) - lngOffset,
        ],
        [
          Math.max(...latitudes) + latOffset,
          Math.max(...longitudes) + lngOffset,
        ],
      ];

      map.fitBounds(bounds, { padding: [10, 10] }); // Optional padding
    }
  }, [items, map]);

  return null;
};

const Map = () => {
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

  // Memoize handlers passed to ViewerPopup and Marker events for stable refs
  const onItemClick = useCallback(handleItemClick, [handleItemClick]);
  const onClose = useCallback(handleClosePopup, [handleClosePopup]);
  const onNext = useCallback(handleNextItem, [handleNextItem]);
  const onPrevious = useCallback(handlePreviousItem, [handlePreviousItem]);

  useEffect(() => {
    if (!isItemsLoading) {
      stopLoading();
    }
    if (itemsError) {
      setErrorMessage(itemsError);
    }
  }, [isItemsLoading, itemsError, stopLoading, setErrorMessage]);

  return (
    <>
      <Helmet>
        <link rel="canonical" href={`${DOMAIN}map`} />
        <title>Abstract Altitudes</title>
        <meta
          name="description"
          content="Explore our interactive map showcasing stunning drone-captured aerial images from various locations. Discover breathtaking views and unique perspectives from above."
        />
      </Helmet>
      <LoadingErrorHandler isLoading={isLoading} error={error}>
        <div className={styles.MapContainer}>
          <MapContainer
            center={MAP_INITIAL_CENTER}
            zoom={MAP_INITIAL_ZOOM}
            className={`${styles.leafletContainer} custom-map`}
            style={{ height: "100vh", width: "100%" }}
            zoomControl={true}
            minZoom={2}
            maxZoom={18}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            touchZoom={true}
          >
            <TileLayer
              url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
              attribution="© Mapbox © OpenStreetMap"
              tileSize={512}
              zoomOffset={-1}
              id="mapbox/satellite-v9"
              accessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
            />
            {items.map((item) => (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={redPinIcon}
                eventHandlers={{ click: () => onItemClick(item) }}
              />
            ))}

            <FitBounds items={items} />
          </MapContainer>

          {isModalOpen && (
            <ViewerPopup
              item={selectedItem}
              isOpen={isModalOpen}
              onClose={onClose}
              onNext={onNext}
              onPrevious={onPrevious}
            />
          )}
        </div>
      </LoadingErrorHandler>
    </>
  );
};

export default React.memo(Map);
