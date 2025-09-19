// src/frontend/components/LazyViewerPanorama.jsx

import React, { Suspense, lazy } from "react";

// Lazy load the ViewerPanorama component
const ViewerPanorama = lazy(() => import("./ViewerPanorama"));

const LazyViewerPanorama = (props) => {
  return (
    <Suspense fallback={<div>Loading panorama viewer...</div>}>
      <ViewerPanorama {...props} />
    </Suspense>
  );
};

export default LazyViewerPanorama;
