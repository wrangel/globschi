// src/frontend/components/ViewerPopup.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import FullScreenModal from "./FullScreenModal";
import Viewer from "./Viewer";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation";

/**
 * ViewerPopup component displays a fullscreen modal containing a Viewer.
 *
 * Navigation via swipe gestures is disabled; navigation occurs only via left/right arrow buttons.
 *
 * Props:
 * - item: The current media item to display (required).
 * - isOpen: Controls whether the modal is open.
 * - onClose: Callback to close the modal.
 * - onNext: Callback to go to next item.
 * - onPrevious: Callback to go to previous item.
 */
const ViewerPopup = ({ item, isOpen, onClose, onNext, onPrevious }) => {
  const [isNavigationMode, setIsNavigationMode] = useState(true);

  // Toggle navigation mode on/off
  const toggleMode = () => {
    setIsNavigationMode((prevMode) => !prevMode);
  };

  // Prevent swipe navigation by omitting swipe handlers, relying on buttons only

  // Keyboard navigation hook to handle shortcut keys for navigation & close
  useKeyboardNavigation(onClose, onPrevious, onNext);

  // If no item provided, render nothing
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

ViewerPopup.propTypes = {
  item: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default React.memo(ViewerPopup);
