// src/frontend/components/FullScreenModal.jsx

import { useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import styles from "../styles/FullScreenModal.module.css";

/**
 * FullScreenModal renders a fullscreen modal dialog with focus trapping,
 * keyboard accessibility, and outside click to close.
 *
 * Features:
 * - Traps keyboard focus within the modal while opened.
 * - Supports Tab navigation cycling inside modal content.
 * - Closes modal with Escape key.
 * - Restores focus to the opener element on close.
 * - Clicking outside modal content closes modal.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen Whether the modal is visible.
 * @param {function} props.onClose Callback to close modal.
 * @param {React.ReactNode} props.children Modal content.
 */
const FullScreenModal = memo(function FullScreenModal({
  isOpen,
  onClose,
  children,
}) {
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store focused element to restore focus after modal closes
    triggerRef.current = document.activeElement;

    // Focus first interactive element inside modal
    const focusableElementsSelector =
      'button, [href], [tabindex]:not([tabindex="-1"]), input, select, textarea';
    const focusableElements = modalRef.current.querySelectorAll(
      focusableElementsSelector
    );
    const firstFocusable = focusableElements[0];
    firstFocusable?.focus();

    // Keyboard event handler to trap focus & close modal with Escape
    const handleKeyDown = (event) => {
      const focusable = modalRef.current.querySelectorAll(
        focusableElementsSelector
      );
      const firstElem = focusable[0];
      const lastElem = focusable[focusable.length - 1];

      if (event.key === "Tab") {
        // Shift + Tab on first element: move to last
        if (event.shiftKey && document.activeElement === firstElem) {
          event.preventDefault();
          lastElem.focus();
        }
        // Tab on last element: move to first
        else if (!event.shiftKey && document.activeElement === lastElem) {
          event.preventDefault();
          firstElem.focus();
        }
      }

      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup: remove listener and restore focus on modal close/unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  // Don't render modal if closed
  if (!isOpen) return null;

  // Click outside content closes modal
  const handleOutsideClick = () => onClose();

  return (
    <div className={styles.fullscreenOverlay} onClick={handleOutsideClick}>
      <div
        className={styles.fullscreenContent}
        onClick={(e) => e.stopPropagation()} // Prevent bubbling close on content clicks
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Invisible heading for screen readers */}
        <h2 id="modal-title" className={styles.visuallyHidden}>
          Modal
        </h2>
        {children}

        {/* Always show close button */}
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
