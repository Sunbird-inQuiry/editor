import React, { useState, useEffect, useCallback } from 'react';
import type { IEditorEvents, ToolbarAction } from '../../types/editor';
import { useTreeStore } from '../../store/tree.store';
import { useEditorStore } from '../../store/editor.store';
import { useSaveHierarchy } from '../../hooks/useSaveHierarchy';
import { useToolbarActions } from '../../hooks/useToolbarActions';
import { Topbar } from '../Topbar/Topbar';
import OutlineTree from '../OutlineTree/OutlineTree';
import { useUiStore } from '../../store/ui.store';
import { notifySuccess } from '../../utils/notify';
import { telemetryInteract } from '../../utils/telemetry';
import ContextualEditor from '../ContextualEditor/ContextualEditor';
import UnsavedChangesModal from '../modals/UnsavedChangesModal';
import { QuestionTypeSelectorModal } from '../modals/QuestionTypeSelectorModal';
import { ConnectedConfirmDialog } from '../modals/ConfirmDialog';

interface SplitEditorShellProps {
  events: IEditorEvents;
}

export function SplitEditorShell({ events }: SplitEditorShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [pendingBack, setPendingBack] = useState(false);

  const isDirty = useEditorStore((s) => s.isDirty);
  const editorMode = useEditorStore((s) => s.editorMode);
  const lastSaved = useEditorStore((s) => s.lastSaved);

  const { save, isSaving } = useSaveHierarchy();
  const { runAction } = useToolbarActions(save);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const handleToolbarEvent = useCallback(
    async (event: { action: ToolbarAction; data?: unknown }) => {
      const { action, data } = event;
      events.onToolbarEvent?.(event);
      // Old editor logs an INTERACT per toolbar action.
      if (!['onFormValueChange', 'onFormStatusChange'].includes(action)) {
        telemetryInteract(action);
      }

      switch (action) {
        case 'onFormStatusChange': {
          const valid = (data as { isValid?: boolean } | undefined)?.isValid ?? true;
          setIsFormValid(valid);
          break;
        }
        case 'back': {
          if (isDirty) { setPendingBack(true); setShowUnsavedPrompt(true); }
          break;
        }
        case 'preview': {
          const { showPreview, setShowPreview } = useEditorStore.getState();
          if (showPreview) { setShowPreview(false); break; }
          // Old editor saves before previewing in edit mode.
          if (editorMode === 'edit' && (await save()) === false) break;
          setShowPreview(true);
          break;
        }
        case 'saveContent': {
          if (await save()) notifySuccess('Question set saved as draft');
          break;
        }
        case 'sendForReview':
        case 'reject':
        case 'publish': {
          await runAction(action, data);
          break;
        }
        default:
          break;
      }
    },
    [events, isDirty, save, runAction, editorMode],
  );

  const handleDiscardAndProceed = useCallback(() => {
    setShowUnsavedPrompt(false);
    if (pendingBack) { setPendingBack(false); events.onToolbarEvent?.({ action: 'back' }); }
  }, [pendingBack, events]);

  const handleSaveAndProceed = useCallback(async () => {
    await save();
    setShowUnsavedPrompt(false);
    if (pendingBack) { setPendingBack(false); events.onToolbarEvent?.({ action: 'back' }); }
  }, [save, pendingBack, events]);

  const handleCancelUnsaved = useCallback(() => {
    setShowUnsavedPrompt(false);
    setPendingBack(false);
  }, []);

  const questionEditorOpen = useUiStore((s) => s.questionEditorOpen);

  return (
    <div className="ce">
      {/* Top bar */}
      <Topbar
        disabled={questionEditorOpen}
        editorMode={editorMode}
        isSaving={isSaving}
        isDirty={isDirty}
        lastSaved={lastSaved}
        isFormValid={isFormValid}
        onToolbarEvent={handleToolbarEvent}
      />

      {/* Three-pane body */}
      <div className="ce-body">
        {/* Reopen tab when tree is collapsed */}
        {sidebarCollapsed && !questionEditorOpen && (
          <button
            className="ce-reopen left"
            onClick={() => setSidebarCollapsed(false)}
            title="Show hierarchy"
            aria-label="Show hierarchy panel"
          >
            ›
          </button>
        )}

        {/* Left — Outline tree */}
        {/* Hierarchy is closed + locked while a question is being edited */}
        <aside
          className={`ce-tree${sidebarCollapsed || questionEditorOpen ? ' collapsed' : ''}`}
          style={questionEditorOpen ? { pointerEvents: 'none' } : undefined}
          aria-disabled={questionEditorOpen || undefined}
        >
          <OutlineTree onCollapse={() => setSidebarCollapsed(true)} />
        </aside>

        {/* Center — Contextual editor */}
        <main className="ce-main">
          <ContextualEditor
            hasContent={useTreeStore.getState().treeData.length > 0}
            onToolbarEvent={handleToolbarEvent}
          />
        </main>
      </div>

      {/* Modals */}
      {showUnsavedPrompt && (
        <UnsavedChangesModal
          onDiscard={handleDiscardAndProceed}
          onSave={handleSaveAndProceed}
          onCancel={handleCancelUnsaved}
          isSaving={isSaving}
        />
      )}
      <QuestionTypeSelectorModal />
      <ConnectedConfirmDialog />
    </div>
  );
}

export default SplitEditorShell;
