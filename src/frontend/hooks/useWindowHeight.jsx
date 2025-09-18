// src/frontend/hooks/useWindowHeight.jsx

import { useState, useLayoutEffect } from "react";

/**
 * Custom hook that returns a boolean indicating if the viewport height is less than or equal to the threshold.
 * @param {number} threshold - Height in pixels to consider very short viewport. Default 360.
 * @returns {boolean} - true if viewport height <= threshold
 */
const useWindowHeight = (threshold = 360) => {
  const [isVeryShort, setIsVeryShort] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight <= threshold : false
  );

  useLayoutEffect(() => {
    const handleResize = () => {
      setIsVeryShort(window.innerHeight <= threshold);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on mount

    return () => window.removeEventListener("resize", handleResize);
  }, [threshold]);

  return isVeryShort;
};

export default useWindowHeight;
