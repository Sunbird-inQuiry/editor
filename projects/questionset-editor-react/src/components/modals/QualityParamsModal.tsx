import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import styles from './QualityParamsModal.module.scss';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface QualityParamsModalProps {
  contentId: string;
  action: 'approve' | 'reject';
  onConfirm: (comment: string, score?: number) => void;
  onCancel: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const QualityParamsModal: React.FC<QualityParamsModalProps> = ({
  contentId: _contentId,
  action,
  onConfirm,
  onCancel,
}) => {
  const isApprove = action === 'approve';

  const [score, setScore] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [scoreError, setScoreError] = useState<string>('');
  const [commentError, setCommentError] = useState<string>('');

  const title = isApprove ? 'Quality Review' : 'Reject Content';
  const confirmLabel = isApprove ? 'Approve' : 'Reject';
  const confirmVariant = isApprove ? 'primary' : 'danger';

  // Validation
  const validate = (): boolean => {
    let valid = true;

    if (isApprove && score !== '') {
      const num = Number(score);
      if (!Number.isFinite(num) || num < 0 || num > 100) {
        setScoreError('Score must be a number between 0 and 100.');
        valid = false;
      } else {
        setScoreError('');
      }
    } else {
      setScoreError('');
    }

    if (!isApprove && comment.trim() === '') {
      setCommentError('A comment is required when rejecting content.');
      valid = false;
    } else {
      setCommentError('');
    }

    return valid;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    const parsedScore = isApprove && score !== '' ? Number(score) : undefined;
    onConfirm(comment.trim(), parsedScore);
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScore(e.target.value);
    if (scoreError) setScoreError('');
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    if (commentError) setCommentError('');
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant={confirmVariant} onClick={handleConfirm}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal title={title} isOpen onClose={onCancel} footer={footer} size="md">
      <div className={styles.root}>
        {/* Quality score — only for approve */}
        {isApprove && (
          <div className={styles.field}>
            <label htmlFor="quality-score" className={styles.label}>
              Quality Score
              <span className={styles.optional}> (optional, 0–100)</span>
            </label>
            <input
              id="quality-score"
              type="number"
              min={0}
              max={100}
              step={1}
              className={`${styles.input} ${scoreError ? styles.inputError : ''}`}
              placeholder="e.g. 85"
              value={score}
              onChange={handleScoreChange}
              aria-describedby={scoreError ? 'quality-score-error' : undefined}
              aria-invalid={!!scoreError}
            />
            {scoreError && (
              <p id="quality-score-error" className={styles.errorText} role="alert">
                {scoreError}
              </p>
            )}
          </div>
        )}

        {/* Comments */}
        <div className={styles.field}>
          <label htmlFor="quality-comment" className={styles.label}>
            Comments
            {!isApprove && <span className={styles.required} aria-hidden="true"> *</span>}
            {isApprove && <span className={styles.optional}> (optional)</span>}
          </label>
          <textarea
            id="quality-comment"
            className={`${styles.textarea} ${commentError ? styles.inputError : ''}`}
            placeholder={
              isApprove
                ? 'Add any notes or feedback for this content…'
                : 'Provide a reason for rejection…'
            }
            rows={4}
            value={comment}
            onChange={handleCommentChange}
            aria-describedby={commentError ? 'quality-comment-error' : undefined}
            aria-invalid={!!commentError}
            aria-required={!isApprove}
          />
          {commentError && (
            <p id="quality-comment-error" className={styles.errorText} role="alert">
              {commentError}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export { QualityParamsModal };
export default QualityParamsModal;
