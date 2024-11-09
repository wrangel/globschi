// src/views/PanoPage.js

import React, { useState, useEffect, useCallback } from "react";
import PanView from "../components/PanView"; // Import your PanView component
import FullScreenModal from "../components/FullScreenModal"; // Import the FullScreenModal component
import "../styles/PanoPage.css"; // Optional: import styles for PanoPage

function PanoPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItemUrl, setSelectedItemUrl] = useState(null); // State for selected panorama URL
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/combined-data");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Filter items to only include those with viewer 'pano'
      const filteredItems = data.filter((item) => item.viewer === "pano");
      setItems(filteredItems);
    } catch (e) {
      console.error("Error fetching data:", e);
      setError("Failed to load items. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleItemClick = (url) => {
    setSelectedItemUrl(url); // Set the selected URL for viewing
    setIsModalOpen(true); // Open the modal
  };

  const handleCloseViewer = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedItemUrl(null); // Clear selected URL
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="pano-page">
      <h1>Panorama URLs</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id} onClick={() => handleItemClick(item.actualUrl)}>
            {item.name || `Panorama ${item.id}`}
          </li>
        ))}
      </ul>

      {/* Full-Screen Modal for Panorama Viewer */}
      <FullScreenModal isOpen={isModalOpen} onClose={handleCloseViewer}>
        <PanView imageUrl={selectedItemUrl} />
      </FullScreenModal>
    </div>
  );
}

export default React.memo(PanoPage);
