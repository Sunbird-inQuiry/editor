import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { useLabels } from '../../hooks/useLabels';

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
// Component — themed like ConfirmDialog (sb-card, ce-btn buttons)
// -----------------------------------------------------------------------------

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  onSave,
  onDiscard,
  onCancel,
  isSaving,
}) => {
  const L = useLabels();

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isSaving) onCancel(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onCancel, isSaving]);

  const portalTarget = document.querySelector('.ce') ?? document.body;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, fontFamily: 'var(--sb-font)',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget && !isSaving) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-changes-title"
    >
      <div
        style={{
          background: 'var(--sb-card)', borderRadius: 18,
          width: 480, maxWidth: '100%',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--sb-shadow-deep)',
          overflow: 'hidden',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px 16px' }}>
          <span id="unsaved-changes-title" style={{ fontWeight: 800, fontSize: 18, flex: 1, color: 'var(--sb-text)' }}>
            {L('ui.unsavedChanges', 'Unsaved Changes')}
          </span>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: 4, borderRadius: 6, color: 'var(--sb-text-muted)',
              display: 'grid', placeItems: 'center',
            }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '0 24px 24px' }}>
          <p style={{ fontSize: 15, color: 'var(--sb-text-2)', lineHeight: 1.6, margin: 0 }}>
            {L('ui.unsavedChangesMsg', 'You have unsaved changes. What would you like to do?')}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 24px', borderTop: '1px solid var(--sb-border)',
        }}>
          <button type="button" className="ce-btn ghost" onClick={onCancel} disabled={isSaving}>
            {L('ui.stay', 'Stay')}
          </button>
          <span style={{ flex: 1 }} aria-hidden="true" />
          <button type="button" className="ce-btn danger" onClick={onDiscard} disabled={isSaving}>
            <Icon name="trash" size={15} />
            {L('ui.discardChanges', 'Discard Changes')}
          </button>
          <button type="button" className="ce-btn primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? L('ui.saving', 'Saving…') : L('ui.saveLeave', 'Save & Leave')}
          </button>
        </div>
      </div>
    </div>,
    portalTarget,
  );
};

export default UnsavedChangesModal;
