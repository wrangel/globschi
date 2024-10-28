import React, { useRef, useCallback, useState } from "react";
import { useSwipeable } from "react-swipeable";
import PanoramaViewer from "./PanoramaViewer";

function ImagePopup({ item, onClose, onNext, onPrevious }) {
  const popupRef = useRef(null);
  const [isPanoramaInteracting, setIsPanoramaInteracting] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  const handlePanoramaInteractionStart = useCallback(() => {
    setIsPanoramaInteracting(true);
  }, []);

  const handlePanoramaInteractionEnd = useCallback(() => {
    setIsPanoramaInteracting(false);
  }, []);

  const toggleMetadata = useCallback(() => {
    setShowMetadata((prev) => !prev);
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: isPanoramaInteracting ? null : onNext,
    onSwipedRight: isPanoramaInteracting ? null : onPrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const renderMetadata = () => (
    <div className="metadata-popup">
      <ul>
        <li>Date: {item.dateTime}</li>
        <li>
          Location: {item.location}, {item.region}, {item.country}
        </li>
        <li>
          Coordinates: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </li>
        <li>Altitude: {item.altitude}</li>
        <li>Postal Code: {item.postalCode}</li>
        {item.road && <li>Road: {item.road}</li>}
        <li>Views: {item.noViews}</li>
      </ul>
    </div>
  );

  const renderContent = () =>
    item.type === "pan" ? (
      <div className="panorama-container">
        <PanoramaViewer
          url={item.actualUrl}
          onInteractionStart={handlePanoramaInteractionStart}
          onInteractionEnd={handlePanoramaInteractionEnd}
        />
      </div>
    ) : (
      <img src={item.actualUrl} alt={item.name} />
    );

  if (!item) return null;

  return (
    <div className="image-popup" {...swipeHandlers}>
      <div className="image-popup-content" ref={popupRef}>
        {renderContent()}
        <button className="close-button" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <button
          className="nav-button prev"
          onClick={onPrevious}
          aria-label="Previous"
          disabled={isPanoramaInteracting}
        >
          &#8249;
        </button>
        <button
          className="nav-button next"
          onClick={onNext}
          aria-label="Next"
          disabled={isPanoramaInteracting}
        >
          &#8250;
        </button>
        <button
          className="metadata-button"
          onClick={toggleMetadata}
          aria-label="Toggle Metadata"
        >
          &#9432;
        </button>
        {showMetadata && renderMetadata()}
      </div>
    </div>
  );
}

export default ImagePopup;
