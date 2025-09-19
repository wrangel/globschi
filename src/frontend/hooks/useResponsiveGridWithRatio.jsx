// src/frontend/hooks/useResponsiveGridWithRatio.js

import { useEffect, useState } from "react";

export const useResponsiveGridWithRatio = (
  baseGutter = 16,
  ratio = -4 / 16
) => {
  const [gridConfig, setGridConfig] = useState({
    columnWidth: 300,
    columnGutter: baseGutter,
    rowGutter: baseGutter * ratio,
  });

  useEffect(() => {
    const updateGrid = () => {
      const width = window.innerWidth;
      let columnWidth = 300;
      let gutter = baseGutter;

      if (width < 600) {
        columnWidth = 200;
        gutter = 12;
      } else if (width < 900) {
        columnWidth = 250;
        gutter = 14;
      }

      setGridConfig({
        columnWidth,
        columnGutter: gutter,
        rowGutter: gutter * ratio,
      });
    };

    updateGrid();
    window.addEventListener("resize", updateGrid);
    return () => window.removeEventListener("resize", updateGrid);
  }, [baseGutter, ratio]);

  return gridConfig;
};
