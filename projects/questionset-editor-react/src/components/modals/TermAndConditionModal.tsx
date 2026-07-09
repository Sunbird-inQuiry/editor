import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { useLabels } from '../../hooks/useLabels';
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
  const L = useLabels();
  const [agreed, setAgreed] = useState(false);

  const footer = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        {L('button_labels.cancel_btn_label', 'Cancel')}
      </Button>
      <Button variant="primary" disabled={!agreed} onClick={onConfirm}>
        {L('button_labels.submit_collection_btn_label', 'Submit for Review')}
      </Button>
    </>
  );

  return (
    <Modal
      title={L('lbl.acceptTerms', 'Accept Terms & Conditions')}
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
            {L('ui.agreeTerms', 'I agree to the Terms & Conditions and Content Policy')}
          </span>
        </label>
      </div>
    </Modal>
  );
};

export default TermAndConditionModal;
