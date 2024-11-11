// src/frontend/components/withItemRendering.js
import React from "react";
import ViewerPopup from "./ViewerPopup";
import { useItemViewer } from "../hooks/useItemViewer";
import PortfolioItem from "./PortfolioItem";
import MapMarker from "./MapMarker";

const withItemRendering = (WrappedComponent) => {
  return function WithItemRendering({ items = [], ...props }) {
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
          {/* Render MapMarkers or PortfolioItems based on WrappedComponent */}
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

export default withItemRendering;
