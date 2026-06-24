import React from 'react';
import { Save, Trash2, X } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import styles from './UnsavedChangesModal.module.scss';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface UnsavedChangesModalProps {
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  onSave,
  onDiscard,
  onCancel,
  isSaving,
}) => {
  const footer = (
    <>
      {/* Stay — lowest priority, leftmost on the ghost side */}
      <Button
        variant="ghost"
        onClick={onCancel}
        disabled={isSaving}
        leftIcon={<X size={15} strokeWidth={2} />}
      >
        Stay
      </Button>

      {/* Spacer pushes the two action buttons to the right */}
      <span className={styles.spacer} aria-hidden="true" />

      <Button
        variant="danger"
        onClick={onDiscard}
        disabled={isSaving}
        leftIcon={<Trash2 size={15} strokeWidth={2} />}
      >
        Discard Changes
      </Button>

      <Button
        variant="primary"
        onClick={onSave}
        isLoading={isSaving}
        loadingLabel="Saving…"
        leftIcon={!isSaving ? <Save size={15} strokeWidth={2} /> : undefined}
      >
        Save &amp; Leave
      </Button>
    </>
  );

  return (
    <Modal
      title="Unsaved Changes"
      isOpen
      onClose={onCancel}
      footer={footer}
      size="sm"
      disableOverlayClose={isSaving}
      disableEscapeClose={isSaving}
      descriptionId="unsaved-changes-desc"
    >
      <div className={styles.root}>
        <p id="unsaved-changes-desc" className={styles.message}>
          You have unsaved changes. What would you like to do?
        </p>
      </div>
    </Modal>
  );
};

export default UnsavedChangesModal;
