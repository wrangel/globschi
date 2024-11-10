// src/App.js

import React, { useState, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import HamburgerMenu from "./components/HamburgerMenu";
import ImagePopup from "./components/ImagePopup"; // Import ImagePopup
import PanoramaViewer from "./components/PanoramaViewer"; // Import PanoramaViewer
import styles from "./styles/SharedStyles.module.css";

// Lazy load the Home, About, and Map components
const Home = React.lazy(() => import("./views/Home"));
const About = React.lazy(() => import("./views/About"));
const Map = React.lazy(() => import("./views/Map"));

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [isPanoramaOpen, setIsPanoramaOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleOpenImagePopup = () => {
    setIsImagePopupOpen(true);
    setIsMenuOpen(false); // Close menu if it's open
  };

  const handleCloseImagePopup = () => {
    setIsImagePopupOpen(false);
  };

  const handleOpenPanoramaViewer = () => {
    setIsPanoramaOpen(true);
    setIsMenuOpen(false); // Close menu if it's open
  };

  const handleClosePanoramaViewer = () => {
    setIsPanoramaOpen(false);
  };

  return (
    <div className={styles.app}>
      <HamburgerMenu
        isOpen={!isImagePopupOpen && !isPanoramaOpen && isMenuOpen} // Show only if no popups are open
        onToggle={toggleMenu}
        onNavigate={handleNavigate}
      />
      <ErrorBoundary>
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  onOpenImage={handleOpenImagePopup}
                  onOpenPanorama={handleOpenPanoramaViewer}
                />
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/map" element={<Map />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {/* Render popups conditionally */}
      {isImagePopupOpen && (
        <ImagePopup
          item={
            {
              /* Pass your item data here */
            }
          }
          onClose={handleCloseImagePopup}
        />
      )}
      {isPanoramaOpen && (
        <PanoramaViewer
          imageUrl={"/* Your panorama URL here */"}
          onClose={handleClosePanoramaViewer}
        />
      )}
    </div>
  );
}

// Wrap App in Router to use useNavigate
const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default React.memo(AppWithRouter);
