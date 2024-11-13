// src/hocs/WithItemRendering.js
import React from "react";
import ViewerPopup from "../components/ViewerPopup";
import { useItemViewer } from "../hooks/useItemViewer";
import PortfolioItem from "../components/PortfolioItem";
import MapMarker from "../components/MapMarker";

const WithItemRendering = (WrappedComponent) => {
  return function EnhancedComponent({ items = [], ...props }) {
    const {
      selectedItem,
      isModalOpen,
      handleItemClick,
      handleClosePopup,
      handleNextItem,
      handlePreviousItem,
    } = useItemViewer(items);

    return (
      <>
        <WrappedComponent {...props}>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {WrappedComponent.name === "MapPage" ? (
                <MapMarker item={item} onItemClick={handleItemClick} />
              ) : (
                <PortfolioItem item={item} onItemClick={handleItemClick} />
              )}
            </React.Fragment>
          ))}
        </WrappedComponent>
        <ViewerPopup
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={handleClosePopup}
          onNext={handleNextItem}
          onPrevious={handlePreviousItem}
        />
      </>
    );
  };
};

export default WithItemRendering;
