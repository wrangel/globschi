// src/views/MapPage.js

import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import ViewerPopup from "../components/ViewerPopup";
import LoadingErrorHandler from "../components/LoadingErrorHandler";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import { useLoadingError } from "../hooks/useLoadingError";

const redPinIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapPage = () => {
  const { items, isLoading: isItemsLoading, error: itemsError } = useItems();
  const { isLoading, error, startLoading, stopLoading, setErrorMessage } =
    useLoadingError(isItemsLoading);
  const {
    selectedItem,
    isModalOpen,
    handleItemClick,
    handleClosePopup,
    handleNextItem,
    handlePreviousItem,
  } = useItemViewer(items);

  useEffect(() => {
    if (isItemsLoading) {
      startLoading();
    } else {
      stopLoading();
    }
    if (itemsError) {
      setErrorMessage(itemsError);
    }
  }, [isItemsLoading, itemsError, startLoading, stopLoading, setErrorMessage]);

  const markers = useMemo(
    () =>
      items.map((item) => (
        <Marker
          key={item.id}
          position={[item.latitude, item.longitude]}
          icon={redPinIcon}
          eventHandlers={{
            click: () => handleItemClick(item),
          }}
        />
      )),
    [items, handleItemClick]
  );

  return (
    <LoadingErrorHandler isLoading={isLoading} error={error}>
      <div className={styles.mapPageContainer}>
        <MapContainer
          center={[0, 0]}
          zoom={2}
          className={styles.leafletContainer}
          style={{ height: "100vh", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {markers}
        </MapContainer>

        {selectedItem && (
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

export default MapPage;
