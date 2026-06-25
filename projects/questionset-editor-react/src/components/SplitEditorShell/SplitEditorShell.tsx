import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { IEditorEvents, ToolbarAction } from '../../types/editor';
import { useTreeStore } from '../../store/tree.store';
import { useEditorStore } from '../../store/editor.store';
import { useSaveHierarchy } from '../../hooks/useSaveHierarchy';
import { useToolbarActions } from '../../hooks/useToolbarActions';
import { Topbar } from '../Topbar/Topbar';
import OutlineTree from '../OutlineTree/OutlineTree';
import ContextualEditor from '../ContextualEditor/ContextualEditor';
import LibraryDock from '../LibraryDock/LibraryDock';
import UnsavedChangesModal from '../modals/UnsavedChangesModal';
import { QuestionTypeSelectorModal } from '../modals/QuestionTypeSelectorModal';
import { ConnectedConfirmDialog } from '../modals/ConfirmDialog';
import styles from './SplitEditorShell.module.scss';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SplitEditorShellProps {
  events: IEditorEvents;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SplitEditorShell({ events }: SplitEditorShellProps) {
  // ── UI state ──────────────────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

  // pending back-navigation (blocked while dirty)
  const [pendingBack, setPendingBack] = useState(false);

  // drag-and-drop active item
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // ── Store ─────────────────────────────────────────────────────────────────
  const isDirty = useEditorStore((s) => s.isDirty);
  const editorMode = useEditorStore((s) => s.editorMode);
  const lastSaved = useEditorStore((s) => s.lastSaved);
  const treeData = useTreeStore((s) => s.treeData);
  const getNodeById = useTreeStore((s) => s.getNodeById);

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { save, isSaving } = useSaveHierarchy();
  const { runAction } = useToolbarActions(save);

  // ── DnD sensors ───────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // ── beforeunload guard ────────────────────────────────────────────────────
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  // ── Toolbar event handler ─────────────────────────────────────────────────
  const handleToolbarEvent = useCallback(
    async (event: { action: ToolbarAction; data?: unknown }) => {
      const { action, data } = event;

      // Always forward the raw event to the consumer first
      events.onToolbarEvent?.(event);

      switch (action) {
        case 'onFormStatusChange': {
          const valid = (data as { isValid?: boolean } | undefined)?.isValid ?? true;
          setIsFormValid(valid);
          break;
        }

        case 'back': {
          if (isDirty) {
            setPendingBack(true);
            setShowUnsavedPrompt(true);
          }
          // If not dirty, consumer already received the event — no further action
          break;
        }

        case 'saveContent': {
          await save();
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
    [events, isDirty, save, runAction],
  );

  // ── Unsaved changes modal handlers ────────────────────────────────────────
  const handleDiscardAndProceed = useCallback(() => {
    setShowUnsavedPrompt(false);
    if (pendingBack) {
      setPendingBack(false);
      events.onToolbarEvent?.({ action: 'back' });
    }
  }, [pendingBack, events]);

  const handleSaveAndProceed = useCallback(async () => {
    await save();
    setShowUnsavedPrompt(false);
    if (pendingBack) {
      setPendingBack(false);
      events.onToolbarEvent?.({ action: 'back' });
    }
  }, [save, pendingBack, events]);

  const handleCancelUnsaved = useCallback(() => {
    setShowUnsavedPrompt(false);
    setPendingBack(false);
  }, []);

  // ── DnD handlers ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveNodeId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (_event: DragEndEvent) => {
      setActiveNodeId(null);
    },
    [],
  );

  const handleDragCancel = useCallback(() => {
    setActiveNodeId(null);
  }, []);

  // ── Active drag node label ────────────────────────────────────────────────
  const activeNode = activeNodeId ? getNodeById(activeNodeId) : null;
  const activeNodeName = activeNode?.name ?? activeNodeId ?? '';

  // ── Rendered tree has content ─────────────────────────────────────────────
  const hasContent = treeData.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.shell}>
        {/* ── Topbar ─────────────────────────────────────────────────────── */}
        <Topbar
          editorMode={editorMode}
          isSaving={isSaving}
          isDirty={isDirty}
          lastSaved={lastSaved}
          isFormValid={isFormValid}
          onToolbarEvent={handleToolbarEvent}
        />

        {/* ── Workspace ──────────────────────────────────────────────────── */}
        <div className={styles.workspace}>
          {/* Left panel — Outline / Tree */}
          <aside
            className={[styles.outline, sidebarCollapsed ? styles.outlineCollapsed : ''].join(' ')}
            aria-label="Outline tree"
          >
            {!sidebarCollapsed && (
              <OutlineTree onCollapse={() => setSidebarCollapsed(true)} />
            )}
          </aside>

          {/* Reopen tab — outline */}
          {sidebarCollapsed && (
            <button
              className={styles.reopenTabLeft}
              onClick={() => setSidebarCollapsed(false)}
              title="Open outline"
              aria-label="Open outline panel"
            >
              <span className={styles.reopenTabLabel}>›</span>
            </button>
          )}

          {/* Center — Contextual editor */}
          <main className={styles.center} aria-label="Editor area">
            <ContextualEditor
              hasContent={hasContent}
              onToolbarEvent={handleToolbarEvent}
            />
          </main>

          {/* Reopen tab — library dock */}
          {dockCollapsed && (
            <button
              className={styles.reopenTabRight}
              onClick={() => setDockCollapsed(false)}
              title="Open library"
              aria-label="Open library panel"
            >
              <span className={styles.reopenTabLabel}>‹</span>
            </button>
          )}

          {/* Right panel — Library dock */}
          <aside
            className={[styles.dock, dockCollapsed ? styles.dockCollapsed : ''].join(' ')}
            aria-label="Library dock"
          >
            {!dockCollapsed && (
              <LibraryDock onCollapse={() => setDockCollapsed(true)} />
            )}
          </aside>
        </div>

        {/* ── Unsaved changes modal ───────────────────────────────────────── */}
        {showUnsavedPrompt && (
          <UnsavedChangesModal
            onDiscard={handleDiscardAndProceed}
            onSave={handleSaveAndProceed}
            onCancel={handleCancelUnsaved}
            isSaving={isSaving}
          />
        )}

        {/* ── Question type picker ─────────────────────────────────────────── */}
        <QuestionTypeSelectorModal />

        {/* ── Confirm delete ───────────────────────────────────────────────── */}
        <ConnectedConfirmDialog />

        {/* ── Drag overlay ────────────────────────────────────────────────── */}
        <DragOverlay dropAnimation={null}>
          {activeNodeId ? (
            <div className={styles.dragChip} role="status" aria-label={`Dragging ${activeNodeName}`}>
              <span className={styles.dragChipDot} aria-hidden="true" />
              <span className={styles.dragChipName}>{activeNodeName}</span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default SplitEditorShell;
