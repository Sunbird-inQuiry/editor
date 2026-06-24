import React from 'react';
import Modal from '../shared/Modal';
import Button, { ButtonVariant } from '../shared/Button';
import { useUiStore } from '../../store/ui.store';
import styles from './ConfirmDialog.module.scss';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

// -----------------------------------------------------------------------------
// Base ConfirmDialog
// -----------------------------------------------------------------------------

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  const footer = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant={confirmVariant as ButtonVariant} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      title={title}
      isOpen
      onClose={onCancel}
      footer={footer}
      size="sm"
      descriptionId="confirm-dialog-message"
    >
      <div className={styles.root}>
        <p id="confirm-dialog-message" className={styles.message}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

// -----------------------------------------------------------------------------
// ConnectedConfirmDialog
// Reads from useUiStore and handles the 'confirmDelete' modal type.
// modalData shape: { title?, message?, confirmLabel?, confirmVariant?, onConfirm? }
// -----------------------------------------------------------------------------

export const ConnectedConfirmDialog: React.FC = () => {
  const activeModal = useUiStore((s) => s.activeModal);
  const modalData = useUiStore((s) => s.modalData);
  const closeModal = useUiStore((s) => s.closeModal);

  if (activeModal !== 'confirmDelete') return null;

  const title = (modalData.title as string | undefined) ?? 'Confirm Action';
  const message =
    (modalData.message as string | undefined) ??
    'Are you sure you want to proceed? This action cannot be undone.';
  const confirmLabel = (modalData.confirmLabel as string | undefined) ?? 'Delete';
  const confirmVariant =
    (modalData.confirmVariant as 'primary' | 'danger' | undefined) ?? 'danger';

  const handleConfirm = () => {
    const onConfirm = modalData.onConfirm as (() => void) | undefined;
    onConfirm?.();
    closeModal();
  };

  return (
    <ConfirmDialog
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      confirmVariant={confirmVariant}
      onConfirm={handleConfirm}
      onCancel={closeModal}
    />
  );
};
