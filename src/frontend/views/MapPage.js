import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import ImagePopup from "../components/ImagePopup"; // Import ImagePopup
import PanoramaViewer from "../components/PanoramaViewer"; // Import PanoramaViewer
import FullScreenModal from "../components/FullScreenModal"; // Import FullScreenModal

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
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for handling popups
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data from backend
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

  // Handle marker click events
  const handleMarkerClick = (index) => {
    setSelectedItemIndex(index); // Set the selected item index
    const item = items[index];

    if (item.viewer === "pano") {
      setIsModalOpen(true); // Open Panorama Viewer if viewer is pano
    }
  };

  const handleClosePopup = () => {
    setIsModalOpen(false); // Close modal
    setSelectedItemIndex(null); // Clear selected item index
  };

  return (
    <div>
      <MapContainer
        center={[0, 0]}
        zoom={2}
        className={styles.leafletContainer}
        style={{ height: "100vh", width: "100%" }}
        zoomControl={false} // Disable default zoom control
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
              click: () => handleMarkerClick(index), // Handle marker click
            }}
          >
            <Popup>
              <div className={styles.popupContent}>
                <h4>{item.name}</h4>
                {/* You can add more details here if needed */}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Render ImagePopup or PanoramaViewer based on selection */}
      {selectedItemIndex !== null && (
        <>
          {items[selectedItemIndex].viewer === "pano" ? (
            <FullScreenModal isOpen={isModalOpen} onClose={handleClosePopup}>
              <PanoramaViewer
                imageUrl={items[selectedItemIndex].actualUrl} // Assuming actualUrl is the panorama URL
                onClose={handleClosePopup}
              />
            </FullScreenModal>
          ) : (
            <ImagePopup
              item={items[selectedItemIndex]}
              onClose={handleClosePopup}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MapPage;
