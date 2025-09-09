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
export const useItemViewer = (items) => {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute index of selected item to enable navigation
  const selectedItemIndex = useMemo(
    () => items.findIndex((item) => item.id === selectedItemId),
    [items, selectedItemId]
  );

  // Get the selected item data
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) || null,
    [items, selectedItemId]
  );

  // Open modal and select clicked item
  const handleItemClick = useCallback((clickedItem) => {
    setSelectedItemId(clickedItem.id);
    setIsModalOpen(true);
  }, []);

  // Close modal and clear selection
  const handleClosePopup = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  }, []);

  // Navigate to the next item if possible
  const handleNextItem = useCallback(() => {
    if (selectedItemIndex < items.length - 1) {
      setSelectedItemId(items[selectedItemIndex + 1].id);
    }
  }, [items, selectedItemIndex]);

  // Navigate to the previous item if possible
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
