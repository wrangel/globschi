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
    onSwipedLeft: () => isNavigationMode && onNext(),
    onSwipedRight: () => isNavigationMode && onPrevious(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 50,
    swipeDuration: 500,
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
          isNavigationMode={isNavigationMode}
          toggleMode={toggleMode}
        />
      </div>
    </FullScreenModal>
  );
};

export default React.memo(ViewerPopup);
