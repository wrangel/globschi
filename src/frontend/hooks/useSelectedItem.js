// src/frontend/hooks/useSelectedItem.js
import { useState, useCallback } from "react";

export const useSelectedItem = () => {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = useCallback((clickedItem) => {
    setSelectedItemId(clickedItem.id);
    setIsModalOpen(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  }, []);

  return {
    selectedItemId,
    isModalOpen,
    handleItemClick,
    handleClosePopup,
  };
};
