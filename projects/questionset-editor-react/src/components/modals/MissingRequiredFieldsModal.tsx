import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { useLabels } from '../../hooks/useLabels';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface MissingFieldGroup {
  tab: string;
  fields: string[];
}

export interface MissingRequiredFieldsModalProps {
  groups: MissingFieldGroup[];
  onClose: () => void;
}

// -----------------------------------------------------------------------------
// Component — themed like ConfirmDialog/UnsavedChangesModal (sb-card, ce-btn)
// -----------------------------------------------------------------------------

const MissingRequiredFieldsModal: React.FC<MissingRequiredFieldsModalProps> = ({ groups, onClose }) => {
  const L = useLabels();

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const portalTarget = document.querySelector('.ce') ?? document.body;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, fontFamily: 'var(--sb-font)',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="missing-fields-title"
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
          <span id="missing-fields-title" style={{ fontWeight: 800, fontSize: 18, flex: 1, color: 'var(--sb-text)' }}>
            {L('ui.missingRequiredFieldsTitle', 'Required fields missing')}
          </span>
          <button
            type="button"
            onClick={onClose}
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
          <p style={{ fontSize: 15, color: 'var(--sb-text-2)', lineHeight: 1.6, margin: '0 0 10px' }}>
            {L('ui.missingRequiredFieldsMsg', 'Please fill the following required fields before saving:')}
          </p>
          {groups.map((g) => (
            <div key={g.tab} style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--sb-text)', margin: '0 0 4px' }}>
                {g.tab}
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--sb-text-2)', fontSize: 14, lineHeight: 1.8 }}>
                {g.fields.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '16px 24px', borderTop: '1px solid var(--sb-border)',
        }}>
          <button type="button" className="ce-btn primary" onClick={onClose}>
            {L('button_labels.close_btn_label', 'Close')}
          </button>
        </div>
      </div>
    </div>,
    portalTarget,
  );
};

export default MissingRequiredFieldsModal;
