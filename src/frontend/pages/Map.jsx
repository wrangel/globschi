import React, { useEffect, useRef, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import LoadingErrorHandler from "../components/LoadingErrorHandler";
import PopupViewer from "../components/PopupViewer";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import { useLoadingError } from "../hooks/useLoadingError";
import MascotCorner from "../components/MascotCorner";
import ErrorBoundary from "../components/ErrorBoundary";
import { DOMAIN } from "../constants";
import styles from "../styles/Map.module.css";

function calculateBounds(items) {
  if (!items.length) return { center: [0, 0], zoom: 4 };

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

  const center = [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
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

  return { center, zoom: Math.max(zoom, 4) };
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

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [view, setView] = useState({ center: [0, 0], zoom: 4 });

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
    if (!mapRef.current && mapContainer.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            satellite: {
              type: "raster",
              tiles: [
                "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
              ],
              tileSize: 256,
            },
          },
          layers: [
            {
              id: "satellite-layer",
              type: "raster",
              source: "satellite",
              minzoom: 0,
              maxzoom: 18,
            },
          ],
        },
        center: view.center,
        zoom: view.zoom,
        attributionControl: false,
        interactive: true,
        dragPan: true,
        dragRotate: false,
      });

      mapRef.current.on("moveend", () => {
        const center = mapRef.current.getCenter();
        const zoom = mapRef.current.getZoom();
        setView({ center: [center.lng, center.lat], zoom });
      });

      mapRef.current.on("load", () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        items.forEach((item) => {
          const popup = new maplibregl.Popup({
            closeOnClick: true,
            closeButton: true,
          }).setText(item.name || "");

          const marker = new maplibregl.Marker()
            .setLngLat([item.longitude, item.latitude])
            .addTo(mapRef.current);

          marker.getElement().addEventListener("click", () => {
            popup.setLngLat(marker.getLngLat()).addTo(mapRef.current);
            onItemClick(item);
          });

          markersRef.current.push(marker);
        });
      });
    }
  }, [items, onItemClick, view.center, view.zoom]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: view.center, zoom: view.zoom });
    }
  }, [view]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isItemsLoading) stopLoading();
    if (itemsError) setErrorMessage(itemsError);
  }, [isItemsLoading, itemsError, stopLoading, setErrorMessage]);

  // 🖱️ Cursor override: force default on canvas
  useEffect(() => {
    if (mapRef.current && mapContainer.current) {
      mapContainer.current.classList.add("maplibre-default-cursor");

      const canvas = mapContainer.current.querySelector(".maplibregl-canvas");
      if (canvas) {
        const observer = new MutationObserver(() => {
          canvas.style.cursor = "default";
        });
        observer.observe(canvas, {
          attributes: true,
          attributeFilter: ["style"],
        });

        return () => observer.disconnect();
      }
    }
  }, []);

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
          <div
            ref={mapContainer}
            className={styles.MapContainer}
            style={{ width: dimensions.width, height: dimensions.height }}
          />
          {isModalOpen && (
            <PopupViewer
              item={selectedItem}
              isOpen={isModalOpen}
              onClose={onClose}
              onNext={onNext}
              onPrevious={onPrevious}
            />
          )}
        </ErrorBoundary>
      </LoadingErrorHandler>
    </>
  );
};

export default React.memo(MapPage);
