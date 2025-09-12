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
      triggerRef.current = document.activeElement;

      const focusableSelector =
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';
      const focusableElements =
        modalRef.current.querySelectorAll(focusableSelector);
      const firstFocusableElement = focusableElements[0];
      firstFocusableElement?.focus();

      const handleKeyDown = (event) => {
        const focusableElements =
          modalRef.current.querySelectorAll(focusableSelector);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.key === "Tab") {
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
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
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
