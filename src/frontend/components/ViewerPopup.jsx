// src/frontend/components/ViewerPopup.jsx

import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import FullScreenModal from "./FullScreenModal";
import Viewer from "./Viewer";

/**
 * ViewerPopup component wraps the Viewer inside a fullscreen modal,
 * adding swipe gesture support for navigation.
 *
 * Handles toggling navigation mode and forwarding swipe gestures to change items.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.item - The item to display in the viewer.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Function} props.onNext - Callback to go to the next item.
 * @param {Function} props.onPrevious - Callback to go to the previous item.
 *
 * @returns {JSX.Element|null} The fullscreen modal wrapping the viewer or null if no item.
 */
const ViewerPopup = ({ item, isOpen, onClose, onNext, onPrevious }) => {
  const [isNavigationMode, setIsNavigationMode] = useState(true);

  // Function to toggle navigation mode between navigation and exploration
  const toggleMode = () => {
    setIsNavigationMode((prevMode) => !prevMode);
  };

  // Swipe handlers for navigating items; only active in navigation mode
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (isNavigationMode) {
        onNext();
      }
    },
    onSwipedRight: () => {
      if (isNavigationMode) {
        onPrevious();
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (!item) return null;

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose}>
      <div {...handlers} style={{ width: "100%", height: "100%" }}>
        <Viewer
          item={item}
          isOpen={isOpen}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
          isNavigationMode={isNavigationMode} // pass current navigation mode
          toggleMode={toggleMode} // pass toggle function to viewer
        />
      </div>
    </FullScreenModal>
  );
};

export default React.memo(ViewerPopup);
