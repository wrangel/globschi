// src/frontend/hooks/useItemViewer.js

import { useState, useCallback, useMemo } from "react";

export const useItemViewer = (items) => {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedItemIndex = useMemo(
    () => items.findIndex((item) => item.id === selectedItemId),
    [items, selectedItemId]
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) || null,
    [items, selectedItemId]
  );

  const handleItemClick = useCallback((clickedItem) => {
    setSelectedItemId(clickedItem.id);
    setIsModalOpen(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  }, []);

  const handleNextItem = useCallback(() => {
    if (selectedItemIndex < items.length - 1) {
      setSelectedItemId(items[selectedItemIndex + 1].id);
    }
  }, [items, selectedItemIndex]);

  const handlePreviousItem = useCallback(() => {
    if (selectedItemIndex > 0) {
      setSelectedItemId(items[selectedItemIndex - 1].id);
    }
  }, [items, selectedItemIndex]);

  return {
    selectedItem,
    isModalOpen,
    handleItemClick,
    handleClosePopup,
    handleNextItem,
    handlePreviousItem,
  };
};
