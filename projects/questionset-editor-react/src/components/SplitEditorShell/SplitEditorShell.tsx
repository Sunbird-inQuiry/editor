import React, { useState, useEffect, useCallback } from 'react';
import { EditorRootContext } from '../shared/EditorRootContext';
import type { IEditorEvents, ToolbarAction, INode } from '../../types/editor';
import { useTreeStore } from '../../store/tree.store';
import { useEditorStore } from '../../store/editor.store';
import { useSaveHierarchy } from '../../hooks/useSaveHierarchy';
import { useToolbarActions } from '../../hooks/useToolbarActions';
import { Topbar } from '../Topbar/Topbar';
import OutlineTree from '../OutlineTree/OutlineTree';
import { useUiStore } from '../../store/ui.store';
import { notifySuccess } from '../../utils/notify';
import { label } from '../../utils/labels';
import { telemetryInteract } from '../../utils/telemetry';
import ContextualEditor from '../ContextualEditor/ContextualEditor';
import UnsavedChangesModal from '../modals/UnsavedChangesModal';
import MissingRequiredFieldsModal, { type MissingFieldGroup } from '../modals/MissingRequiredFieldsModal';
import { QuestionTypeSelectorModal } from '../modals/QuestionTypeSelectorModal';
import { ConnectedConfirmDialog } from '../modals/ConfirmDialog';
import { findMissingRequiredFields } from '../SparkMetaForm/SparkMetaForm';
import { detectNodeKind } from '../../utils/nodeKind';

interface SplitEditorShellProps {
  events: IEditorEvents;
}

export function SplitEditorShell({ events }: SplitEditorShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const [pendingBack, setPendingBack] = useState(false);
  const [missingFieldGroups, setMissingFieldGroups] = useState<MissingFieldGroup[] | null>(null);

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
          // Each tab mounts its own SparkMetaForm, so onFormStatusChange only
          // ever reflects the currently active tab. Save as Draft saves the
          // whole hierarchy, not just whatever's currently selected, so check
          // the root AND every section's required fields regardless of
          // selection — not just the active node. Questions have their own
          // required-field checks (QuestionEditor's invalidReason) and are
          // never included here.
          const { rootFormConfig, unitFormConfig } = useEditorStore.getState();
          const { treeData, treeCache } = useTreeStore.getState();

          // updateNode() patches land in treeCache (and the node's top-level
          // props via deepMergeNode), NOT inside node.metadata — activeNodeMeta
          // overlays treeCache on top of node.metadata for exactly this reason.
          // Reading node.metadata alone here saw stale, never-updated values.
          const liveMeta = (node: INode) =>
            ({ ...(node.metadata ?? {}), ...(treeCache[node.id] ?? {}) }) as Record<string, unknown>;

          const TAB_LABELS: Record<string, string> = {
            'Audience & Curriculum': label('ui.audience', 'Audience & Curriculum'),
            Behaviour: label('ui.behaviour', 'Behaviour'),
          };
          const detailsLabel = label('ui.details', 'Details');
          const order: string[] = [];
          const byGroup = new Map<string, string[]>();
          const addMissing = (fields: typeof rootFormConfig, meta: Record<string, unknown>, sectionName?: string) => {
            for (const f of findMissingRequiredFields(fields ?? [], meta)) {
              const tab = (f.section && TAB_LABELS[f.section]) || detailsLabel;
              const group = sectionName ? `${sectionName} — ${tab}` : tab;
              if (!byGroup.has(group)) { byGroup.set(group, []); order.push(group); }
              byGroup.get(group)!.push(f.label);
            }
          };

          const rootNode = treeData[0];
          if (rootNode) addMissing(rootFormConfig, liveMeta(rootNode));

          // isFolder from the API is unreliable for questions (they often
          // come back with isFolder:true) — detectNodeKind checks
          // mimeType/objectType/isQuestion/questionType first instead.
          const sections: typeof treeData = [];
          const queue = [...(rootNode?.children ?? [])];
          while (queue.length) {
            const n = queue.shift()!;
            if (detectNodeKind(n) === 'section') sections.push(n);
            if (n.children) queue.push(...n.children);
          }
          for (const section of sections) {
            addMissing(unitFormConfig, liveMeta(section), section.name);
          }

          if (order.length > 0) {
            setMissingFieldGroups(order.map((tab) => ({ tab, fields: byGroup.get(tab)! })));
            break;
          }
          if (await save()) notifySuccess(label('messages.success.001', 'Question set saved as draft'));
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
