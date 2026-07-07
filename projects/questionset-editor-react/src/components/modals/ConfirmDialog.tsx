import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../shared/Icon';
import { useUiStore } from '../../store/ui.store';
import { useTreeStore } from '../../store/tree.store';
import { deleteQuestion } from '../../api/question';
import { useEditorStore } from '../../store/editor.store';
import { useLabels } from '../../hooks/useLabels';

// ---------------------------------------------------------------------------
// ConnectedConfirmDialog — wired to the 'confirmDelete' modal in ui.store
// ---------------------------------------------------------------------------

export const ConnectedConfirmDialog: React.FC = () => {
  const activeModal  = useUiStore((s) => s.activeModal);
  const modalData    = useUiStore((s) => s.modalData);
  const closeModal   = useUiStore((s) => s.closeModal);
  const deleteNode   = useTreeStore((s) => s.deleteNode);
  const getNodeById  = useTreeStore((s) => s.getNodeById);
  const setIsDirty   = useEditorStore((s) => s.setIsDirty);
  const L            = useLabels();

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    if (activeModal === 'confirmDelete') document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [activeModal, closeModal]);

  if (activeModal !== 'confirmDelete') return null;

  const nodeId = modalData.nodeId as string | undefined;
  const node   = nodeId ? getNodeById(nodeId) : undefined;
  const isQuestion = node?.isQuestion ?? false;
  const nodeName   = node?.name ?? '';
  const nodeType   = isQuestion ? 'question' : 'section';

  const title   = (modalData.title   as string | undefined) ?? `Delete ${nodeType}`;
  const message = (modalData.message as string | undefined) ??
    `Are you sure you want to delete "${nodeName}"? This action cannot be undone.`;

  const handleConfirm = async () => {
    if (nodeId) {
      // For real (non-temp) questions, retire via API — same as old editor
      if (isQuestion && !nodeId.startsWith('temp-')) {
        try { await deleteQuestion(nodeId); } catch { /* best-effort */ }
      }
      deleteNode(nodeId);
      setIsDirty(true);
    }
    const onConfirm = modalData.onConfirm as (() => void) | undefined;
    onConfirm?.();
    closeModal();
  };

  const portalTarget = document.querySelector('.ce') ?? document.body;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, fontFamily: 'var(--sb-font)',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) closeModal(); }}
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
          <span style={{ fontWeight: 800, fontSize: 18, flex: 1, color: 'var(--sb-text)' }}>
            {title}
          </span>
          <button
            type="button"
            onClick={closeModal}
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
            {message}
          </p>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '16px 24px', borderTop: '1px solid var(--sb-border)',
        }}>
          <button type="button" className="ce-btn ghost" onClick={closeModal}>
            {L('button_labels.cancel_btn_label', 'Cancel')}
          </button>
          <button type="button" className="ce-btn danger" onClick={() => void handleConfirm()}>
            <Icon name="trash" size={15} />
            {L('button_labels.delete_btn_label', 'Delete')}
          </button>
        </div>
      </div>
    </div>,
    portalTarget,
  );
};

export default ConnectedConfirmDialog;
