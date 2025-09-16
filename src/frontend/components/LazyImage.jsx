// src/frontend/components/LazyImage.jsx

import { useEffect, useRef, useState } from "react";

const LazyImage = ({ src, alt, className, style }) => {
  const imgRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!imgRef.current) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, observerInstance) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observerInstance.disconnect();
            }
          });
        },
        { rootMargin: "100px" } // preload a bit before entering viewport
      );

      observer.observe(imgRef.current);

      return () => observer.disconnect();
    } else {
      // Fallback if IntersectionObserver is unsupported
      setIsVisible(true);
    }
  }, []);

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : ""}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
    />
  );
};

export default LazyImage;
