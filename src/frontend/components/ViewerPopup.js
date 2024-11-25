// src/frontend/components/ViewerPopup.js

import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import FullScreenModal from "./FullScreenModal";
import Viewer from "./Viewer";

const ViewerPopup = ({ item, isOpen, onClose, onNext, onPrevious }) => {
  const [isNavigationMode, setIsNavigationMode] = useState(true);

  const toggleMode = () => {
    setIsNavigationMode((prevMode) => !prevMode);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (isNavigationMode) {
        console.log("Swiped left");
        onNext();
      }
    },
    onSwipedRight: () => {
      if (isNavigationMode) {
        console.log("Swiped right");
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
          isNavigationMode={isNavigationMode} // Pass down the navigation mode state
          toggleMode={toggleMode} // Pass down the toggle function
        />
      </div>
    </FullScreenModal>
  );
};

export default React.memo(ViewerPopup);
