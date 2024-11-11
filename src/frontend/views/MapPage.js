// src/frontend/views/MapPage.js
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import LoadingErrorHandler from "../components/LoadingErrorHandler";
import { useLoadingError } from "../hooks/useLoadingError";
import { MAP_INITIAL_CENTER, MAP_INITIAL_ZOOM } from "../constants";
import withItemRendering from "../components/withItemRendering";

const MapPage = (props) => {
  const { isLoading, error } = useLoadingError(false);

  return (
    <LoadingErrorHandler isLoading={isLoading} error={error}>
      <div className={styles.mapPageContainer}>
        <MapContainer
          center={MAP_INITIAL_CENTER}
          zoom={MAP_INITIAL_ZOOM}
          className={styles.leafletContainer}
          style={{ height: "100vh", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {props.children} {/* Rendered items will be passed here */}
        </MapContainer>
      </div>
    </LoadingErrorHandler>
  );
};

export default withItemRendering(MapPage);
