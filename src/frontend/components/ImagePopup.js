// src/components/ImagePopup.js
import React, { useState, useEffect, useRef, memo } from "react";
import { useDrag, usePinch } from "@use-gesture/react";
import styles from "../styles/ImagePopup.module.css";
import LoadingOverlay from "./LoadingOverlay";
import ControlButtons from "./ControlButtons";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation"; // Import the custom hook

const ImagePopup = memo(({ item, onClose, onNext, onPrevious }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showMetadata, setShowMetadata] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  // Load image
  useEffect(() => {
    if (item) {
      setIsLoading(true);
      const img = new Image();
      img.src = item.actualUrl;

      img.onload = () => {
        setIsLoading(false);
        if (imgRef.current) {
          imgRef.current.src = item.actualUrl;
        }
      };

      return () => {
        img.onload = null; // Cleanup
      };
    }
  }, [item]);

  // Gesture bindings
  const bindDrag = useDrag(({ offset: [x, y] }) => {
    setPosition({ x, y });
  });

  const bindPinch = usePinch(({ offset: [d] }) => {
    setScale(Math.max(1, Math.min(5, d)));
  });

  // Use the custom keyboard navigation hook
  useKeyboardNavigation(onClose, onPrevious, onNext);

  return (
    <div className={styles.imagePopup} role="dialog" aria-modal="true">
      {isLoading && <LoadingOverlay thumbnailUrl={item.thumbnailUrl} />}
      <div
        {...bindDrag()}
        {...bindPinch()}
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <img
          ref={imgRef}
          src={item.actualUrl}
          alt={item.name}
          className={`${styles.image} ${isLoading ? styles.hidden : ""}`}
        />
      </div>

      {/* Control Buttons */}
      <ControlButtons
        onClose={onClose}
        onPrevious={onPrevious}
        onNext={onNext}
        onToggleMetadata={() => setShowMetadata((prev) => !prev)}
      />

      {/* Metadata Popup */}
      {showMetadata && (
        <div className={styles.metadataPopup}>
          <pre>{item.metadata}</pre>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}&maptype=satellite`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapLink}
          >
            View on Map
          </a>
        </div>
      )}
    </div>
  );
});

export default ImagePopup;
