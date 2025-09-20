// src/frontend/pages/Map.js

import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Map, Marker } from "pigeon-maps";
import LoadingErrorHandler from "../components/LoadingErrorHandler";
import PopupViewer from "../components/PopupViewer";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import { useLoadingError } from "../hooks/useLoadingError";
import MascotCorner from "../components/MascotCorner";
import ErrorBoundary from "../components/ErrorBoundary";
import { DOMAIN } from "../constants";
import styles from "../styles/Map.module.css";

function mapboxSatelliteProvider(x, y, z, dpr) {
  const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/${z}/${x}/${y}${
    dpr >= 2 ? "@2x" : ""
  }?access_token=${token}`;
}

function calculateBounds(items) {
  if (!items.length) return { center: [0, 0], zoom: 2 };

  let minLat = items[0].latitude,
    maxLat = items[0].latitude,
    minLng = items[0].longitude,
    maxLng = items[0].longitude;

  items.forEach(({ latitude, longitude }) => {
    if (latitude < minLat) minLat = latitude;
    if (latitude > maxLat) maxLat = latitude;
    if (longitude < minLng) minLng = longitude;
    if (longitude > maxLng) maxLng = longitude;
  });

  const center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
  const latDelta = maxLat - minLat;
  const lngDelta = maxLng - minLng;
  const maxDelta = Math.max(latDelta, lngDelta);

  let zoom;
  if (maxDelta > 60) zoom = 2;
  else if (maxDelta > 30) zoom = 4;
  else if (maxDelta > 15) zoom = 6;
  else if (maxDelta > 10) zoom = 8;
  else if (maxDelta > 5) zoom = 10;
  else if (maxDelta > 2) zoom = 12;
  else zoom = 14;

  return { center, zoom };
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

  const onItemClick = useCallback(handleItemClick, [handleItemClick]);
  const onClose = useCallback(handleClosePopup, [handleClosePopup]);
  const onNext = useCallback(handleNextItem, [handleNextItem]);
  const onPrevious = useCallback(handlePreviousItem, [handlePreviousItem]);

  const [view, setView] = useState({ center: [0, 0], zoom: 2 });

  // Manage Dimensions for map width/height (numeric only)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (items.length > 0) {
      setView(calculateBounds(items));
    }
  }, [items]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <MascotCorner />
      <Helmet>
        <link rel="canonical" href={`${DOMAIN}map`} />
        <title>Abstract Altitudes</title>
        <meta
          name="description"
          content="Explore our interactive map showcasing stunning drone-captured aerial images from various locations. Discover breathtaking views and unique perspectives from above."
        />
      </Helmet>
      <LoadingErrorHandler isLoading={isLoading} error={error}>
        <ErrorBoundary>
          <div className={styles.MapContainer}>
            <Map
              provider={mapboxSatelliteProvider}
              dprs={[1, 2]}
              height={dimensions.height}
              width={dimensions.width}
              center={view.center}
              zoom={view.zoom}
              onBoundsChanged={({ center, zoom }) => setView({ center, zoom })}
              minZoom={2}
              maxZoom={18}
              animate={true}
              twoFingerDragWarning={null}
            >
              {items.map((item) => (
                <Marker
                  key={item.id}
                  anchor={[item.latitude, item.longitude]}
                  onClick={() => onItemClick(item)}
                  title={item.name || "Map marker"}
                />
              ))}
            </Map>

            {isModalOpen && (
              <PopupViewer
                item={selectedItem}
                isOpen={isModalOpen}
                onClose={onClose}
                onNext={onNext}
                onPrevious={onPrevious}
              />
            )}
          </div>
        </ErrorBoundary>
      </LoadingErrorHandler>
    </>
  );
};

export default React.memo(MapPage);
