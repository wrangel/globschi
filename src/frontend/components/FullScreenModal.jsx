// src/frontend/components/FullScreenModal.jsx

import { useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import styles from "../styles/FullScreenModal.module.css";

/**
 * FullScreenModal component renders a fullscreen modal dialog with focus trapping and keyboard controls.
 */
const FullScreenModal = memo(({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element so we can restore focus when modal closes
      triggerRef.current = document.activeElement;

      // Focus the first focusable element within the modal
      // You might want to expand focusable selector depending on your needs (e.g. buttons, inputs, selects, textareas, links, etc.)
      const focusableSelector =
        'button, [href], [tabindex]:not([tabindex="-1"]), input, select, textarea';
      const firstFocusableElement =
        modalRef.current.querySelector(focusableSelector);
      firstFocusableElement?.focus();

      // Handle keyboard navigation and closing
      const handleKeyDown = (event) => {
        const focusableElements =
          modalRef.current.querySelectorAll(focusableSelector);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.key === "Tab") {
          // Trap focus inside the modal
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
          ) {
            event.preventDefault();
            firstElement.focus();
          }
        }

        if (event.key === "Escape") {
          // Close modal on Escape key press
          onClose();
        }
      };

      // Attach keyboard handler
      document.addEventListener("keydown", handleKeyDown);

      // Cleanup on modal close or unmount
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        // Restore focus to the trigger element after modal closes
        if (
          triggerRef.current &&
          document.activeElement !== triggerRef.current
        ) {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.fullscreenOverlay} onClick={onClose}>
      <div
        className={styles.fullscreenContent}
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside content
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <h2 id="modal-title" className={styles.visuallyHidden}>
          Modal Title
        </h2>
        {children}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close Modal"
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
});

FullScreenModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default FullScreenModal;
