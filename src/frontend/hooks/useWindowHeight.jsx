// src/frontend/hooks/useWindowHeight.jsx

import { useState, useEffect } from "react";

/**
 * Custom hook that returns a boolean indicating if the viewport height is less than or equal to the threshold.
 * @param {number} threshold - Height in pixels to consider very short viewport. Default 360.
 * @returns {boolean} - true if viewport height <= threshold
 */
const useWindowHeight = (threshold = 360) => {
  const [isVeryShort, setIsVeryShort] = useState(
    window.innerHeight <= threshold
  );

  useEffect(() => {
    const handleResize = () => {
      setIsVeryShort(window.innerHeight <= threshold);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [threshold]);

  return isVeryShort;
};

export default useWindowHeight;
