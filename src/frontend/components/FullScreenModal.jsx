// src/frontend/components/FullScreenModal.jsx

import { useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import styles from "../styles/FullScreenModal.module.css";

/**
 * FullScreenModal component renders a fullscreen modal dialog with focus trapping and keyboard controls.
 *
 * Features:
 * - Focus management: traps keyboard focus within the modal when opened.
 * - Keyboard accessibility: supports Tab navigation inside modal and Escape to close.
 * - Restores focus to the element that triggered the modal on close.
 * - Click outside modal content closes the modal.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Callback function to close the modal.
 * @param {React.ReactNode} props.children - Content to render inside the modal.
 */
const FullScreenModal = memo(({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element so we can restore focus when modal closes
      triggerRef.current = document.activeElement;

      // Focus the first focusable element within the modal
      const firstFocusableElement = modalRef.current.querySelector(
        'button, [href], [tabindex]:not([tabindex="-1"]), input, select, textarea'
      );
      firstFocusableElement?.focus();

      // Handle keyboard navigation and closing
      const handleKeyDown = (event) => {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], [tabindex]:not([tabindex="-1"]), input, select, textarea'
        );
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
        triggerRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  // Do not render modal if not open
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
      >
        <h2 id="modal-title" className={styles.visuallyHidden}>
          Modal Title
        </h2>
        {children}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close Modal"
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
