import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.scss';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /** Title displayed in the modal header. */
  title: string;
  /** Controls visibility. */
  isOpen: boolean;
  /** Callback when the modal requests to close (X button or overlay click). */
  onClose: () => void;
  /** Body content. */
  children: React.ReactNode;
  /** Footer content — typically action buttons. Omit to hide the footer bar. */
  footer?: React.ReactNode;
  /** Max-width variant of the card. Defaults to 'md'. */
  size?: ModalSize;
  /** Prevent closing when the overlay backdrop is clicked. Default false. */
  disableOverlayClose?: boolean;
  /** Prevent closing when Escape key is pressed. Default false. */
  disableEscapeClose?: boolean;
  /** DOM node to portal into. Defaults to document.body. */
  container?: HTMLElement | null;
  /** Additional CSS class applied to the card. */
  cardClassName?: string;
  /** aria-describedby id pointing to a description element inside the body. */
  descriptionId?: string;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const Modal: React.FC<ModalProps> = ({
  title,
  isOpen,
  onClose,
  children,
  footer,
  size = 'md',
  disableOverlayClose = false,
  disableEscapeClose = false,
  container,
  cardClassName,
  descriptionId,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`sbx-modal-title-${Math.random().toString(36).slice(2)}`);

  // ---- Keyboard handling ----------------------------------------------------
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableEscapeClose) {
        e.stopPropagation();
        onClose();
      }
    },
    [disableEscapeClose, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // ---- Body scroll lock -----------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // ---- Focus trap — auto-focus the card on open ----------------------------
  useEffect(() => {
    if (isOpen && cardRef.current) {
      // Brief delay lets CSS animation settle before focus
      const id = requestAnimationFrame(() => cardRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  // ---- Overlay click --------------------------------------------------------
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableOverlayClose) return;
    // Only close when clicking the backdrop itself, not the card
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ---- Render ---------------------------------------------------------------
  if (!isOpen) return null;

  const cardClass = [
    styles.card,
    size !== 'md' ? styles[`card--${size}`] : '',
    cardClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const portalTarget =
    container ?? (typeof document !== 'undefined' ? document.body : null);

  if (!portalTarget) return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div
        ref={cardRef}
        className={cardClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 id={titleId.current} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {children}
        </div>

        {/* Footer — only rendered when consumer provides content */}
        {footer != null && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    portalTarget,
  );
};

export default Modal;
