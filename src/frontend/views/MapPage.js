import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LoadingErrorHandler from "../components/LoadingErrorHandler";
import ViewerPopup from "../components/ViewerPopup";
import { useItems } from "../hooks/useItems";
import { useItemViewer } from "../hooks/useItemViewer";
import { useLoadingError } from "../hooks/useLoadingError";
import styles from "../styles/Map.module.css";
import {
  MAP_INITIAL_CENTER,
  MAP_INITIAL_ZOOM,
  ICON_URLS,
  ICON_SIZES,
} from "../constants";

const { BaseLayer } = LayersControl;

const redPinIcon = new L.Icon({
  iconUrl: ICON_URLS.RED_MARKER,
  shadowUrl: ICON_URLS.MARKER_SHADOW,
  iconSize: ICON_SIZES.MARKER,
  iconAnchor: ICON_SIZES.MARKER_ANCHOR,
  popupAnchor: ICON_SIZES.POPUP_ANCHOR,
  shadowSize: ICON_SIZES.SHADOW,
});

const FitBounds = ({ items }) => {
  const map = useMap();

  useEffect(() => {
    if (items.length > 0) {
      const latitudes = items.map((item) => item.latitude);
      const longitudes = items.map((item) => item.longitude);

      const latOffset = 1.5;
      const lngOffset = 1.5;

      const bounds = [
        [
          Math.min(...latitudes) - latOffset,
          Math.min(...longitudes) - lngOffset,
        ],
        [
          Math.max(...latitudes) + latOffset,
          Math.max(...longitudes) + lngOffset,
        ],
      ];

      map.fitBounds(bounds);
    }
  }, [items, map]);

  return null;
};

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

  useEffect(() => {
    if (!isItemsLoading) {
      stopLoading();
    }
    if (itemsError) {
      setErrorMessage(itemsError);
    }
  }, [isItemsLoading, itemsError, stopLoading, setErrorMessage]);

  return (
    <LoadingErrorHandler isLoading={isLoading} error={error}>
      <div className={styles.mapPageContainer}>
        <MapContainer
          center={MAP_INITIAL_CENTER}
          zoom={MAP_INITIAL_ZOOM}
          className={`${styles.leafletContainer} custom-map`}
          style={{ height: "100vh", width: "100%" }}
          zoomControl={true}
          minZoom={2}
          maxZoom={18}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
            </BaseLayer>
            <BaseLayer name="Dark Theme">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                className={styles.darkTileLayer} /* Apply dark theme via CSS */
              />
            </BaseLayer>
            <BaseLayer name="Satellite">
              <TileLayer
                url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
                attribution="© Mapbox © OpenStreetMap"
                tileSize={512}
                zoomOffset={-1}
                id="mapbox/satellite-v9"
                accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
              />
            </BaseLayer>
          </LayersControl>

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

          <FitBounds items={items} />
        </MapContainer>

        {isModalOpen && (
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

export default React.memo(MapPage);
