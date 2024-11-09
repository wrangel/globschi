// src/components/FullScreenModal.js

import React from "react";
import "../styles/FullScreenModal.css"; // Import styles for the modal

const FullScreenModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fullscreen-overlay" onClick={onClose}>
      <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default FullScreenModal;
