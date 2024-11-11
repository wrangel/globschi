// src/frontend/components/MapMarker.js
import React from "react";
import { Marker } from "react-leaflet";
import { redPinIcon } from "../constants"; // Import redPinIcon from constants

const MapMarker = ({ item, onItemClick }) => (
  <Marker
    position={[item.latitude, item.longitude]}
    icon={redPinIcon}
    eventHandlers={{
      click: () => onItemClick(item),
    }}
  />
);

export default MapMarker;
