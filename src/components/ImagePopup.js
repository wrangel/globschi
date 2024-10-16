// src/components/ImagePopup.js
import React, { useEffect, useRef } from "react";

function ImagePopup({ item, onClose }) {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  if (!item) return null;

  return (
    <div className="image-popup">
      <div className="image-popup-content" ref={popupRef}>
        <img src={item.actualUrl} alt={item.name} />
        <button className="close-button" onClick={onClose} aria-label="Close">
          &times;
        </button>
      </div>
    </div>
  );
}

export default ImagePopup;
