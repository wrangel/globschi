// src/frontend/components/ViewerPopup.jsx

import React, { useState } from "react";
import FullScreenModal from "./FullScreenModal";
import Viewer from "./Viewer";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation";

/**
 * ViewerPopup component renders the fullscreen viewer modal that displays
 * an image or panorama viewer with navigation controls.
 *
 * Navigation via swipe gestures is disabled; navigation will only occur
 * when left/right arrows are clicked in ControlButtons.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.item - The current media item to display.
 * @param {boolean} props.isOpen - Flag to indicate if viewer is open.
 * @param {Function} props.onClose - Callback to close the viewer.
 * @param {Function} props.onNext - Callback to go to next item.
 * @param {Function} props.onPrevious - Callback to go to previous item.
 */
const ViewerPopup = ({ item, isOpen, onClose, onNext, onPrevious }) => {
  const [isNavigationMode, setIsNavigationMode] = useState(true);

  const toggleMode = () => {
    setIsNavigationMode((prevMode) => !prevMode);
  };

  // Swipe navigation handlers removed to prevent unintended navigation

  useKeyboardNavigation(onClose, onPrevious, onNext);

  if (!item) return null;

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose}>
      <div style={{ width: "100%", height: "100%" }}>
        <Viewer
          item={item}
          isOpen={isOpen}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
          isNavigationMode={isNavigationMode}
          toggleMode={toggleMode}
        />
      </div>
    </FullScreenModal>
  );
};

export default React.memo(ViewerPopup);
