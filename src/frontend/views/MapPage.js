// src/views/MapPage.js
import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import ViewerPopup from "../components/ViewerPopup";
import { useItems } from "../hooks/useItems";
import { useSelectedItem } from "../hooks/useSelectedItem";

const redPinIcon = new L.Icon({
  // ... (icon definition)
});

const MapPage = () => {
  const { items, isLoading, error } = useItems();
  const { selectedItemId, isModalOpen, handleItemClick, handleClosePopup } =
    useSelectedItem();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const selectedItem = items.find((item) => item.id === selectedItemId);

  return (
    <div>
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
        {items.map((item) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={redPinIcon}
            eventHandlers={{
              click: () => handleItemClick(item),
            }}
          />
        ))}
      </MapContainer>

      {selectedItem && (
        <ViewerPopup
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default MapPage;
