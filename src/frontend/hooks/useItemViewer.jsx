// src/frontend/hooks/useItemViewer.jsx

import { useState, useCallback, useMemo } from "react";

/**
 * Custom hook to manage state and navigation for a viewed item in a list.
 *
 * Provides selected item, modal open state, and handlers for item selection,
 * modal close, and navigation to next/previous items.
 *
 * @param {Array} items - Array of item objects with at least an `id` property.
 * @returns {Object} An object containing:
 *   - selectedItem: The currently selected item or null if none.
 *   - isModalOpen: Boolean indicating if the modal/viewer is open.
 *   - handleItemClick: Function to select an item and open the modal.
 *   - handleClosePopup: Function to close the modal and clear selection.
 *   - handleNextItem: Function to select the next item in the list.
 *   - handlePreviousItem: Function to select the previous item in the list.
 */
export const useItemViewer = (items = []) => {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedItemIndex = useMemo(() => {
    if (!Array.isArray(items)) return -1;
    return items.findIndex((item) => item.id === selectedItemId);
  }, [items, selectedItemId]);

  const selectedItem = useMemo(() => {
    if (!Array.isArray(items)) return null;
    return items.find((item) => item.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  const handleItemClick = useCallback((clickedItem) => {
    if (clickedItem?.id) {
      setSelectedItemId(clickedItem.id);
      setIsModalOpen(true);
    }
  }, []);

  const handleClosePopup = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  }, []);

  const handleNextItem = useCallback(() => {
    if (selectedItemIndex >= 0 && selectedItemIndex < items.length - 1) {
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
    selectedItemIndex,
    isModalOpen,
    handleItemClick,
    handleClosePopup,
    handleNextItem,
    handlePreviousItem,
  };
};
