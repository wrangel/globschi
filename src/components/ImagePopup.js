// src/components/ImagePopup.js
import React from "react";

function ImagePopup({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="image-popup" onClick={onClose}>
      <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
        <img src={item.actualUrl} alt={item.name} />
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
}

export default ImagePopup;
