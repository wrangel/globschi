// src/frontend/components/ItemRenderer.js
import React from "react";
import PortfolioItem from "./PortfolioItem";
import MapMarker from "./MapMarker";

const ItemRenderer = ({ item, onItemClick, isMapView }) => {
  if (isMapView) {
    return <MapMarker item={item} onItemClick={onItemClick} />;
  } else {
    return <PortfolioItem item={item} onItemClick={onItemClick} />;
  }
};

export default ItemRenderer;
