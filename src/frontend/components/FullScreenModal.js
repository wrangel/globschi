// src/components/FullScreenModal.js
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const FullScreenModal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const triggerRef = useRef(null); // Reference to the element that opened the modal

  // Handle focus trapping
  useEffect(() => {
    if (isOpen) {
      // Save the reference to the element that triggered the modal
      triggerRef.current = document.activeElement;

      // Focus the first focusable element in the modal
      const firstFocusableElement = modalRef.current.querySelector(
        'button, [href], [tabindex]:not([tabindex="-1"]), input, select, textarea'
      );
      firstFocusableElement?.focus();

      // Add event listener for keydown to trap focus
      const handleKeyDown = (event) => {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], [tabindex]:not([tabindex="-1"]), input, select, textarea'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.key === "Tab") {
          if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }

        if (event.key === "Escape") {
          onClose(); // Close modal on Escape key press
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        triggerRef.current?.focus(); // Return focus to the triggering element
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fullscreen-overlay" onClick={onClose}>
      <div
        className="fullscreen-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
      >
        {children}
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close Modal"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Prop Types for validation
FullScreenModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default FullScreenModal;
