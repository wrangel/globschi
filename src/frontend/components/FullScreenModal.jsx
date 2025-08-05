// src/frontend/components/FullScreenModal.jsx

import { useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import styles from "../styles/FullScreenModal.module.css";

const FullScreenModal = memo(({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;

      const firstFocusableElement = modalRef.current.querySelector(
        'button, [href], [tabindex]:not([tabindex="-1"]), input, select, textarea'
      );
      firstFocusableElement?.focus();

      const handleKeyDown = (event) => {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], [tabindex]:not([tabindex="-1"]), input, select, textarea'
        );
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
        triggerRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.fullscreenOverlay} onClick={onClose}>
      <div
        className={styles.fullscreenContent}
        onClick={(e) => e.stopPropagation()}
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
