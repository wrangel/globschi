// src/views/MapPage.js

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapPage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/combined-data");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data);
    } catch (e) {
      console.error("Error fetching data:", e);
      setError("Failed to load items. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {items.map((item) => (
        <Marker key={item.id} position={[item.latitude, item.longitude]}>
          <Popup>
            <h2>{item.metadata}</h2>
            <a href={item.actualUrl} target="_blank" rel="noopener noreferrer">
              View Image
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapPage;
