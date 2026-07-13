import React, { useState, useEffect, useCallback } from 'react';
import { EditorRootContext } from '../shared/EditorRootContext';
import type { IEditorEvents, ToolbarAction } from '../../types/editor';
import { useTreeStore } from '../../store/tree.store';
import { useEditorStore } from '../../store/editor.store';
import { useSaveHierarchy } from '../../hooks/useSaveHierarchy';
import { useValidateAndSave } from '../../hooks/useValidateAndSave';
import { useToolbarActions } from '../../hooks/useToolbarActions';
import { Topbar } from '../Topbar/Topbar';
import OutlineTree from '../OutlineTree/OutlineTree';
import { useUiStore } from '../../store/ui.store';
import { notifySuccess } from '../../utils/notify';
import { label } from '../../utils/labels';
import { telemetryInteract } from '../../utils/telemetry';
import ContextualEditor from '../ContextualEditor/ContextualEditor';
import UnsavedChangesModal from '../modals/UnsavedChangesModal';
import MissingRequiredFieldsModal from '../modals/MissingRequiredFieldsModal';
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
  const missingFieldGroups = useUiStore((s) => s.missingFieldGroups);
  const setMissingFieldGroups = useUiStore((s) => s.setMissingFieldGroups);

  const isDirty = useEditorStore((s) => s.isDirty);
  const editorMode = useEditorStore((s) => s.editorMode);
  const lastSaved = useEditorStore((s) => s.lastSaved);

  const { save, isSaving } = useSaveHierarchy();
  const validateAndSave = useValidateAndSave();
  const { runAction } = useToolbarActions(validateAndSave);

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
      // 'back' with unsaved changes is NOT forwarded yet — the host would
      // navigate away before the prompt shows; it's emitted once the prompt
      // resolves (save/discard handlers below).
      if (!(action === 'back' && isDirty)) events.onToolbarEvent?.(event);
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
          if (await validateAndSave()) notifySuccess(label('messages.success.001', 'Question set saved as draft'));
          break;
        }
        case 'sendForReview':
        case 'reject':
        case 'publish': {
          // Old editor closes after a successful workflow action — emit
          // 'back' so the host navigates away (portal returns to workspace).
          if (await runAction(action, data)) {
            events.onToolbarEvent?.({ action: 'back' });
          }
          break;
        }
        default:
          break;
      }
    },
    [events, isDirty, save, runAction, editorMode, validateAndSave],
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
  const hasContent = useTreeStore((s) => s.treeData.length > 0);

  // Own root element — modals portal into THIS instance's .ce (multiple
  // editors can be mounted on one host page; a global querySelector would
  // always hit the first).
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);

  return (
    <EditorRootContext.Provider value={rootEl}>
    <div className="ce" ref={setRootEl}>
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
            hasContent={hasContent}
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
      {missingFieldGroups && (
        <MissingRequiredFieldsModal
          groups={missingFieldGroups}
          onClose={() => setMissingFieldGroups(null)}
        />
      )}
      <QuestionTypeSelectorModal />
      <ConnectedConfirmDialog />
    </div>
    </EditorRootContext.Provider>
  );
}

export default SplitEditorShell;