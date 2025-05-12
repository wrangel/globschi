// src/frontend/views/MapPage.js

import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import LoadingErrorHandler from "../components/LoadingErrorHandler";
import ViewerPopup from "../components/ViewerPopup";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import { useLoadingError } from "../hooks/useLoadingError";
import { MAP_INITIAL_CENTER, MAP_INITIAL_ZOOM, DOMAIN } from "../constants";
import styles from "../styles/Map.module.css";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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

  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fit bounds when items or map are ready
  useEffect(() => {
    if (
      mapLoaded &&
      mapRef.current &&
      window.google &&
      window.google.maps &&
      Array.isArray(items) &&
      items.length > 0
    ) {
      const bounds = new window.google.maps.LatLngBounds();
      items.forEach(({ latitude, longitude }) => {
        if (
          typeof latitude === "number" &&
          !isNaN(latitude) &&
          typeof longitude === "number" &&
          !isNaN(longitude)
        ) {
          bounds.extend({ lat: latitude, lng: longitude });
        }
      });

      if (items.length === 1) {
        mapRef.current.setCenter(bounds.getCenter());
        mapRef.current.setZoom(12);
      } else {
        // Expand bounds by ~100km margin
        const marginKm = 100;
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const avgLat = (ne.lat() + sw.lat()) / 2;
        const latMargin = marginKm / 111;
        const lngMargin =
          marginKm / (111 * Math.cos((avgLat * Math.PI) / 180) || 1);

        const expandedBounds = new window.google.maps.LatLngBounds(
          {
            lat: sw.lat() - latMargin,
            lng: sw.lng() - lngMargin,
          },
          {
            lat: ne.lat() + latMargin,
            lng: ne.lng() + lngMargin,
          }
        );
        mapRef.current.fitBounds(expandedBounds, { padding: 50 });
      }
    }
  }, [items, mapLoaded]);

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
              mapTypeId="satellite"
              style={{ height: "100vh", width: "100%" }}
              defaultCenter={{
                lat: MAP_INITIAL_CENTER[0],
                lng: MAP_INITIAL_CENTER[1],
              }}
              defaultZoom={MAP_INITIAL_ZOOM}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapId={process.env.REACT_APP_GOOGLE_MAP_ID}
              onLoad={(mapInstance) => {
                mapRef.current = mapInstance;
                setMapLoaded(true);
              }}
            >
              {items.map((item) => (
                <Marker
                  key={item.id}
                  position={{ lat: item.latitude, lng: item.longitude }}
                  // No icon prop = default Google Maps pin!
                  onClick={() => handleItemClick(item)}
                />
              ))}
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
