// src/views/MapPage.js
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import ViewerPopup from "../components/ViewerPopup";
import { useItems } from "../hooks/useItems";

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
  const { items, isLoading, error } = useItems();
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleMarkerClick = (index) => {
    setSelectedItemIndex(index);
  };

  const handleClosePopup = () => {
    setSelectedItemIndex(null);
  };

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
        {items.map((item, index) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={redPinIcon}
            eventHandlers={{
              click: () => handleMarkerClick(index),
            }}
          />
        ))}
      </MapContainer>

      {selectedItemIndex !== null && (
        <ViewerPopup
          item={items[selectedItemIndex]}
          isOpen
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default MapPage;
