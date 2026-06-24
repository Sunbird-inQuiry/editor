import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import styles from './TermAndConditionModal.module.scss';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface TermAndConditionModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const TermAndConditionModal: React.FC<TermAndConditionModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  const [agreed, setAgreed] = useState(false);

  const footer = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="primary" disabled={!agreed} onClick={onConfirm}>
        Submit for Review
      </Button>
    </>
  );

  return (
    <Modal
      title="Accept Terms & Conditions"
      isOpen
      onClose={onCancel}
      footer={footer}
      size="md"
      descriptionId="tnc-description"
    >
      <div className={styles.root}>
        <p id="tnc-description" className={styles.body}>
          By submitting this Question Set for review, you confirm that all content
          included is your original work or appropriately licensed, and that it
          complies with the platform's{' '}
          <strong>Content Guidelines</strong>. All media, text, and other assets
          shared herein are published under a{' '}
          <strong>Creative Commons</strong> license as specified by the platform
          policy. You also agree to abide by the{' '}
          <strong>Content Policy</strong>, which prohibits the submission of
          plagiarised, offensive, or copyrighted material without explicit
          permission. Violation of these terms may result in content removal or
          suspension of your contributor account.
        </p>

        <label className={styles.agreeLabel} htmlFor="tnc-agree">
          <input
            id="tnc-agree"
            type="checkbox"
            className={styles.checkbox}
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            aria-required="true"
          />
          <span className={`${styles.customCheck} ${agreed ? styles.customCheckChecked : ''}`} aria-hidden="true" />
          <span className={styles.agreeText}>
            I agree to the Terms &amp; Conditions and Content Policy
          </span>
        </label>
      </div>
    </Modal>
  );
};

export default TermAndConditionModal;
