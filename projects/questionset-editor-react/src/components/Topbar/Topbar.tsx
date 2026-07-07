import React, { useCallback, useState } from 'react';
import { Icon } from '../shared/Icon';
import type { EditorMode, ToolbarAction } from '../../types/editor';
import { useTreeStore } from '../../store/tree.store';
import { useEditorStore } from '../../store/editor.store';
import { useUiStore } from '../../store/ui.store';
import { Button } from '../shared/Button';
import { PublishChecklist } from '../modals/PublishChecklist';
import { QualityParamsModal } from '../modals/QualityParamsModal';
import styles from './Topbar.module.scss';
import { labelFrom } from '../../utils/labels';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface TopbarProps {
  /** Locks all topbar actions while the inline question editor is open. */
  disabled?: boolean;
  editorMode: EditorMode;
  isSaving: boolean;
  isDirty: boolean;
  lastSaved: string | null;
  isFormValid?: boolean;
  onToolbarEvent: (event: { action: ToolbarAction; data?: unknown }) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatLastSaved(ts: string | null): string {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function deriveStatusLabel(status: unknown): string {
  if (typeof status === 'string' && status.trim().length > 0) {
    return status.trim();
  }
  return 'Draft';
}

// ---------------------------------------------------------------------------
// ReviewCommentModal
// Used for both "Reject" and "Send Back" actions.
// ---------------------------------------------------------------------------
interface ReviewCommentModalProps {
  titleText: string;
  labelText: string;
  placeholderText?: string;
  submitLabel: string;
  submitVariant?: 'primary' | 'danger';
  onConfirm: (comment: string) => void;
  onCancel: () => void;
}

const ReviewCommentModal: React.FC<ReviewCommentModalProps> = ({
  titleText,
  labelText,
  placeholderText = '',
  submitLabel,
  submitVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  const [comment, setComment] = useState('');
  const modalId = titleText.toLowerCase().replace(/\s+/g, '-');

  return (
    <div
      className={styles.sbOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${modalId}-title`}
    >
      <div className={styles.sbModal}>
        <div className={styles.sbModalHeader}>
          <span id={`${modalId}-title`} className={styles.sbModalTitle}>
            {titleText}
          </span>
          <button
            className={styles.sbModalClose}
            onClick={onCancel}
            aria-label="Close"
            type="button"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className={styles.sbModalBody}>
          <label className={styles.sbLabel} htmlFor={`${modalId}-comment`}>
            {labelText}{' '}
            <span aria-hidden="true" style={{ color: 'var(--sbx-error, #DC2626)' }}>
              *
            </span>
          </label>
          <textarea
            id={`${modalId}-comment`}
            className={styles.sbTextarea}
            placeholder={placeholderText}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
            aria-required="true"
          />
          {comment.trim().length === 0 && (
            <p className={styles.sbError}>This field is required.</p>
          )}
        </div>

        <div className={styles.sbModalFooter}>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={submitVariant}
            onClick={() => onConfirm(comment.trim())}
            disabled={comment.trim().length === 0}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ConfirmReviewModal
// Terms & Conditions acceptance before "Send for Review".
// ---------------------------------------------------------------------------
interface ConfirmReviewModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmReviewModal: React.FC<ConfirmReviewModalProps> = ({ onConfirm, onCancel }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div
      className={styles.sbOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-confirm-title"
    >
      <div className={styles.sbModal}>
        <div className={styles.sbModalHeader}>
          <span id="review-confirm-title" className={styles.sbModalTitle}>
            Accepting Terms &amp; Conditions
          </span>
          <button
            className={styles.sbModalClose}
            onClick={onCancel}
            aria-label="Close"
            type="button"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className={styles.sbModalBody}>
          <label
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <span>
              I agree that by submitting this Question Set, I confirm that the content complies
              with the prescribed guidelines, including the Terms of Use and Content Policy, and
              that I consent to publish it under the{' '}
              <a
                href="https://creativecommons.org/licenses"
                target="_blank"
                rel="noreferrer"
                style={{ fontWeight: 600 }}
              >
                Creative Commons Framework
              </a>{' '}
              in accordance with the <strong>Content Policy</strong>. I have made sure that I do
              not violate others&rsquo; copyright or privacy rights.
            </span>
          </label>
        </div>

        <div className={styles.sbModalFooter}>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={!agreed}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Topbar component
// ---------------------------------------------------------------------------
export const Topbar: React.FC<TopbarProps> = ({
  disabled = false,
  editorMode,
  isSaving,
  isDirty,
  lastSaved,
  isFormValid = true,
  onToolbarEvent,
}) => {
  // ── Store selectors ──────────────────────────────────────────────────────
  const reviewComments = useEditorStore((s) => s.reviewComments);
  const uiLabels = useEditorStore((s) => s.labels);
  const L = (path: string, fallback: string) => labelFrom(uiLabels, path, fallback);
  const treeData = useTreeStore((s) => s.treeData);
  const rootNode = treeData[0];
  const title = rootNode?.name ?? 'Untitled';
  const statusLabel = deriveStatusLabel(rootNode?.metadata?.status ?? rootNode?.status);

  const contentId = useEditorStore(
    (s) =>
      s.editorConfig?.context?.contentId ?? s.editorConfig?.context?.identifier ?? '',
  );
  const buttonLoaders = useEditorStore((s) => s.buttonLoaders);

  const { activeModal, modalData, closeModal, openModal } = useUiStore();

  // ── Local modal state ─────────────────────────────────────────────────────
  const [showConfirmReview, setShowConfirmReview] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSendBack, setShowSendBack] = useState(false);

  // ── Mode booleans — old header.component handleActionButtons() matrix ────
  const editorConfig = useEditorStore((s) => s.editorConfig);
  const isEditMode = editorMode === 'edit';
  // Old editor: reject/publish for review OR orgreview.
  const isReviewMode = editorMode === 'review' || editorMode === 'orgreview';
  const isSourcingReviewMode = editorMode === 'sourcingreview';
  const isReadOnly = editorMode === 'read';
  // Reviewer edits during org/sourcing review (context.enableReviewEdit).
  const reviewerEditAllowed =
    (editorMode === 'orgreview' || editorMode === 'sourcingreview') &&
    !!editorConfig?.context?.enableReviewEdit;
  const hideSubmitForReview = !!editorConfig?.config?.hideSubmitForReviewBtn;

  // ── Reviewer feedback (shown via topbar button → popup) ───────────────────
  const [showFeedback, setShowFeedback] = useState(false);
  const visibleComments = isEditMode
    ? reviewComments.filter((c) => c.text.trim())
    : [];

  // ── Emit helper ───────────────────────────────────────────────────────────
  const emit = useCallback(
    (action: ToolbarAction, data?: unknown) => {
      onToolbarEvent({ action, data });
    },
    [onToolbarEvent],
  );

  // ── Modal confirm handlers ────────────────────────────────────────────────
  const handlePublishConfirm = useCallback(() => {
    closeModal();
    emit('publish');
  }, [closeModal, emit]);

  const handleQualityConfirm = useCallback(
    (comment: string, score?: number) => {
      const action = modalData?.action as 'approve' | 'reject' | undefined;
      closeModal();
      if (action === 'approve') {
        emit('sourcingApprove', { comment, score });
      } else {
        emit('reject', { comment });
      }
    },
    [closeModal, emit, modalData],
  );

  const handleSendBack = useCallback(
    (comment: string) => {
      setShowSendBack(false);
      emit('sendBackForCorrections', { comment });
    },
    [emit],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className={styles.topbarWrapper}>
        <header
          className="ce-top"
          role="banner"
          style={disabled ? { pointerEvents: 'none', opacity: 0.55 } : undefined}
          aria-disabled={disabled || undefined}
        >
        {/* ── Left: Back + Title + Status ─────────────────────── */}
          <button
            className="ce-back"
            onClick={() => emit('back')}
            aria-label="Go back"
            type="button"
          >
            <Icon name="arrow-left" size={20} />
          </button>

          <span className="title" title={title}>
            {title}
          </span>

          <span
            className="ce-pill"
            data-status={statusLabel.toLowerCase()}
            aria-label={`Status: ${statusLabel}`}
          >
            {L(`ui.status${statusLabel}`, statusLabel)}
          </span>

          <span className="spacer" />

        {/* ── Right: Save indicator + actions ──────────────────── */}
          {/* Save / dirty indicator */}
          {isSaving ? (
            <span className="ce-saving" aria-live="polite">
              Saving&hellip;
            </span>
          ) : isDirty ? (
            <span className="ce-unsaved" aria-live="polite">
              Unsaved
            </span>
          ) : lastSaved ? (
            <span
              className="ce-saving"
              aria-live="polite"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Icon name="check" size={14} />
              Saved
            </span>
          ) : null}

          {/* Reviewer feedback — only when the reviewer left a comment */}
          {visibleComments.length > 0 && (
            <button
              className="ce-btn ghost"
              type="button"
              onClick={() => setShowFeedback(true)}
              title="View reviewer feedback"
            >
              <Icon name="info" size={15} />
              {L('ui.reviewerFeedback', 'Reviewer feedback')}
            </button>
          )}

          {/* Preview — old editor shows it in every mode for QuestionSets */}
          <button
            className="ce-btn ghost"
            type="button"
            onClick={() => emit('preview')}
            disabled={isSaving}
            title="Preview question set"
          >
            <Icon name="play" size={15} />
            {L('button_labels.preview_collection_btn_label', 'Preview')}
          </button>

          {/* Save as Draft */}
          {((isEditMode && statusLabel !== 'Review') || reviewerEditAllowed) && (
            <button
              className="ce-btn ghost"
              type="button"
              onClick={() => emit('saveContent')}
              disabled={!isFormValid}
              title={!isFormValid ? 'Fill all required fields before saving' : undefined}
            >
              {L('button_labels.save_collection_btn_label', 'Save as Draft')}
            </button>
          )}

          {/* Send for Review */}
          {isEditMode && !hideSubmitForReview && (
            <button
              className="ce-btn primary"
              type="button"
              onClick={() => setShowConfirmReview(true)}
              disabled={buttonLoaders.saveContent || isSaving || !isFormValid}
              title={!isFormValid ? 'Fill all required fields before sending for review' : undefined}
            >
              <Icon name="send" size={15} />
              {L('button_labels.submit_collection_btn_label', 'Send for Review')}
            </button>
          )}

          {/* ── Review mode actions ────────────────────────────── */}
          {isReviewMode && (
            <div className={styles.reviewBtns}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openModal('publishChecklist')}
                disabled={buttonLoaders.publishContent || !isFormValid}
                isLoading={buttonLoaders.publishContent}
              >
                <Icon name="check" size={14} />
                &nbsp;{L('button_labels.publish_collection_btn_label', 'Publish')}
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowRejectModal(true)}
                disabled={buttonLoaders.rejectContent}
                isLoading={buttonLoaders.rejectContent}
              >
                <Icon name="x" size={14} />
                &nbsp;{L('button_labels.reject_collection_btn_label', 'Reject')}
              </Button>

            </div>
          )}

          {/* ── Sourcing review mode actions ───────────────────── */}
          {isSourcingReviewMode && (
            <div className={styles.sourcingBtns}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openModal('qualityParams', { action: 'approve' })}
                disabled={buttonLoaders.sourcingApproveContent}
                isLoading={buttonLoaders.sourcingApproveContent}
              >
                <Icon name="info" size={14} />
                &nbsp;Approve
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => openModal('qualityParams', { action: 'reject' })}
                disabled={buttonLoaders.sourcingRejectContent}
                isLoading={buttonLoaders.sourcingRejectContent}
              >
                <Icon name="x" size={14} />
                &nbsp;Reject
              </Button>
            </div>
          )}
        </header>
      </div>

      {/* Reviewer feedback popup — same card pattern as ConfirmDialog */}
      {showFeedback && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, fontFamily: 'var(--sb-font)',
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowFeedback(false); }}
        >
          <div
            style={{
              background: 'var(--sb-card)', borderRadius: 18,
              width: 520, maxWidth: '100%', maxHeight: '80vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--sb-shadow-deep)', overflow: 'hidden',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px 16px' }}>
              <span style={{ fontWeight: 800, fontSize: 18, flex: 1, color: 'var(--sb-text)' }}>
                {L('ui.reviewerFeedback', 'Reviewer feedback')}
              </span>
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  padding: 4, borderRadius: 6, color: 'var(--sb-text-muted)',
                  display: 'grid', placeItems: 'center',
                }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <div style={{ padding: '0 24px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visibleComments.map((c) => (
                <div key={c.id} style={{ background: 'var(--sb-bg-warm)', border: '1px solid var(--sb-border-soft)', borderRadius: 12, padding: '12px 16px' }}>
                  <p style={{ fontSize: 14.5, color: 'var(--sb-text-2)', lineHeight: 1.6, margin: 0 }}>
                    &ldquo;{c.text}&rdquo;
                  </p>
                  {c.createdOn && (
                    <p style={{ fontSize: 12, color: 'var(--sb-text-faint)', margin: '6px 0 0' }}>
                      {new Date(c.createdOn).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────── */}

      {activeModal === 'publishChecklist' && (
        <PublishChecklist
          contentId={contentId}
          onConfirm={handlePublishConfirm}
          onCancel={closeModal}
        />
      )}

      {activeModal === 'qualityParams' && (
        <QualityParamsModal
          contentId={contentId}
          action={(modalData?.action as 'approve' | 'reject') ?? 'reject'}
          onConfirm={handleQualityConfirm}
          onCancel={closeModal}
        />
      )}

      {showConfirmReview && (
        <ConfirmReviewModal
          onConfirm={() => {
            setShowConfirmReview(false);
            emit('sendForReview');
          }}
          onCancel={() => setShowConfirmReview(false)}
        />
      )}

      {showRejectModal && (
        <ReviewCommentModal
          titleText="Reject Question Set"
          labelText="Reason for rejection"
          placeholderText="Explain why this question set is being rejected"
          submitLabel="Reject"
          submitVariant="danger"
          onConfirm={(comment) => {
            setShowRejectModal(false);
            emit('reject', { comment });
          }}
          onCancel={() => setShowRejectModal(false)}
        />
      )}

      {showSendBack && (
        <ReviewCommentModal
          titleText="Send Back for Corrections"
          labelText="Corrections needed"
          placeholderText="Describe the corrections the author needs to make"
          submitLabel="Send Back"
          submitVariant="primary"
          onConfirm={handleSendBack}
          onCancel={() => setShowSendBack(false)}
        />
      )}
    </>
  );
};
