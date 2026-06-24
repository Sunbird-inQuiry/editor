import React, { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import type { EditorMode, ToolbarAction } from '../../types/editor';
import { useEditorStore } from '../../store/editor.store';
import { useTreeStore } from '../../store/tree.store';
import SparkMetaForm from '../SparkMetaForm/SparkMetaForm';
import styles from './ContextualEditor.module.scss';

// ---------------------------------------------------------------------------
// Lazy-loaded heavy panels (avoids bundling player/question-editor upfront)
// ---------------------------------------------------------------------------

const QuestionEditor = lazy(() => import('../QuestionEditor/QuestionEditor'));
const QumlPlayer = lazy(() => import('../QumlPlayer/QumlPlayer'));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContextualEditorProps {
  /** Current editor operating mode (from parent / SplitEditorShell). */
  editorMode?: EditorMode;
  /** Forwarded to child panels that need to emit toolbar actions. */
  onToolbarEvent: (event: { action: ToolbarAction; data?: unknown }) => void;
  /** Whether the tree has any content yet (used for empty-state guard). */
  hasContent?: boolean;
}

// ---------------------------------------------------------------------------
// Tab definitions — shown for root & section (folder) nodes
// ---------------------------------------------------------------------------

type TabKey = 'details' | 'audience' | 'licensing';

interface Tab {
  key: TabKey;
  label: string;
  /** Optional section filter passed to SparkMetaForm. When undefined all
   *  fields not explicitly assigned to another tab are included here. */
  section?: string;
}

const TABS: Tab[] = [
  { key: 'details', label: 'Details', section: undefined },
  { key: 'audience', label: 'Audience & Curriculum', section: 'Audience & Curriculum' },
  { key: 'licensing', label: 'Licensing', section: 'Licensing' },
];

// ---------------------------------------------------------------------------
// Helper — field filtering by tab
// ---------------------------------------------------------------------------

// Fields that belong to a named section are shown only in that tab.
// Fields with no section (or an unrecognised section) fall into "Details".
function tabSection(tabKey: TabKey): string | undefined {
  return TABS.find((t) => t.key === tabKey)?.section;
}

// ---------------------------------------------------------------------------
// Spinner used in Suspense fallbacks
// ---------------------------------------------------------------------------

function PanelSpinner() {
  return (
    <div className={styles.spinnerWrapper} aria-label="Loading…" role="status">
      <span className={styles.spinner} aria-hidden="true" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ContextualEditor
// ---------------------------------------------------------------------------

const ContextualEditor: React.FC<ContextualEditorProps> = ({
  editorMode: editorModeProp,
  onToolbarEvent,
  hasContent = true,
}) => {
  // ── Stores ──────────────────────────────────────────────────────────────────
  const storeEditorMode = useEditorStore((s) => s.editorMode);
  const showPreview = useEditorStore((s) => s.showPreview);
  const isCurrentNodeRoot = useEditorStore((s) => s.isCurrentNodeRoot);
  const isCurrentNodeFolder = useEditorStore((s) => s.isCurrentNodeFolder);
  const isCurrentNodeQuestion = useEditorStore((s) => s.isCurrentNodeQuestion);
  const rootFormConfig = useEditorStore((s) => s.rootFormConfig);
  const unitFormConfig = useEditorStore((s) => s.unitFormConfig);

  const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
  const activeNodeMeta = useTreeStore((s) => s.activeNodeMeta);
  const breadcrumb = useTreeStore((s) => s.breadcrumb);
  const updateNode = useTreeStore((s) => s.updateNode);
  const selectNode = useTreeStore((s) => s.selectNode);

  // Resolved editor mode (prop beats store, for cases where parent overrides)
  const editorMode = editorModeProp ?? storeEditorMode;
  const isReadOnly = editorMode === 'read';

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>('details');

  // Inline title editing
  const [titleValue, setTitleValue] = useState<string>('');
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // ── Sync title when selected node changes ───────────────────────────────────
  useEffect(() => {
    const nodeName = (activeNodeMeta?.name as string) ?? '';
    setTitleValue(nodeName);
    setIsTitleEditing(false);
  }, [selectedNodeId, activeNodeMeta]);

  // ── Reset to details tab when node selection changes ────────────────────────
  useEffect(() => {
    setActiveTab('details');
  }, [selectedNodeId]);

  // ── Title commit ────────────────────────────────────────────────────────────
  const commitTitle = useCallback(() => {
    const trimmed = titleValue.trim();
    if (selectedNodeId && trimmed && trimmed !== (activeNodeMeta?.name as string)) {
      updateNode(selectedNodeId, { name: trimmed });
    }
    setIsTitleEditing(false);
  }, [selectedNodeId, titleValue, activeNodeMeta, updateNode]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitTitle();
      } else if (e.key === 'Escape') {
        // Revert
        setTitleValue((activeNodeMeta?.name as string) ?? '');
        setIsTitleEditing(false);
      }
    },
    [commitTitle, activeNodeMeta],
  );

  // ── Form field change ───────────────────────────────────────────────────────
  const handleFormChange = useCallback(
    (code: string, value: unknown) => {
      if (!selectedNodeId) return;
      updateNode(selectedNodeId, { [code]: value, metadata: { [code]: value } });
      onToolbarEvent({ action: 'onFormValueChange', data: { field: code, value } });
    },
    [selectedNodeId, updateNode, onToolbarEvent],
  );

  const handleFormValidityChange = useCallback(
    (isValid: boolean) => {
      onToolbarEvent({ action: 'onFormStatusChange', data: { isValid } });
    },
    [onToolbarEvent],
  );

  // ── Form config for the current node ───────────────────────────────────────
  const formConfig = isCurrentNodeRoot ? rootFormConfig : unitFormConfig;

  // ── Determine what to render in the main area ───────────────────────────────
  const nothingSelected = !selectedNodeId;
  const noContent = !hasContent;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={styles.panel}>

      {/* ── Preview overlay — full-panel QuML player ─────────────────────── */}
      {showPreview && (
        <div className={styles.previewOverlay}>
          <Suspense fallback={<PanelSpinner />}>
            <QumlPlayer questionSetId={selectedNodeId ?? ''} onClose={() => onToolbarEvent({ action: 'preview' })} />
          </Suspense>
        </div>
      )}

      {/* ── Empty / no-selection states ───────────────────────────────────── */}
      {(noContent || nothingSelected) && !showPreview && (
        <div className={styles.emptyState} aria-live="polite">
          {noContent
            ? 'Add a section or question to get started.'
            : 'Select a node from the outline'}
        </div>
      )}

      {/* ── Main editing area — only when a node is selected ─────────────── */}
      {!nothingSelected && !noContent && !showPreview && (
        <>
          {/* Breadcrumb */}
          {breadcrumb.length > 0 && (
            <nav className={styles.breadcrumb} aria-label="Node breadcrumb">
              {breadcrumb.map((crumb, index) => {
                const isLast = index === breadcrumb.length - 1;
                return (
                  <React.Fragment key={crumb.id}>
                    {index > 0 && (
                      <ChevronRight
                        size={12}
                        className={styles.breadcrumbSep}
                        aria-hidden="true"
                      />
                    )}
                    {isLast ? (
                      <span className={`${styles.breadcrumbItem} ${styles.breadcrumbItemActive}`}>
                        {crumb.name}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={styles.breadcrumbItem}
                        onClick={() => selectNode(crumb.id)}
                        title={`Navigate to ${crumb.name}`}
                      >
                        {crumb.name}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          {/* Editable title row — shown for root/section/question nodes */}
          <div className={styles.titleRow}>
            {isTitleEditing && !isReadOnly ? (
              <input
                ref={titleInputRef}
                type="text"
                className={styles.titleInput}
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={handleTitleKeyDown}
                aria-label="Node title"
                maxLength={200}
                autoFocus
              />
            ) : (
              <h2
                className={styles.titleDisplay}
                onClick={() => {
                  if (!isReadOnly) setIsTitleEditing(true);
                }}
                title={isReadOnly ? undefined : 'Click to edit title'}
                tabIndex={isReadOnly ? -1 : 0}
                onKeyDown={(e) => {
                  if (!isReadOnly && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setIsTitleEditing(true);
                  }
                }}
                aria-label={`Title: ${titleValue}`}
              >
                {titleValue || 'Untitled'}
              </h2>
            )}
          </div>

          {/* ── Question node → QuestionEditor ───────────────────────────── */}
          {isCurrentNodeQuestion && (
            <div className={styles.tabContent}>
              <Suspense fallback={<PanelSpinner />}>
                <QuestionEditor editorMode={editorMode} />
              </Suspense>
            </div>
          )}

          {/* ── Root / Section node → tabs + SparkMetaForm ───────────────── */}
          {(isCurrentNodeRoot || isCurrentNodeFolder) && !isCurrentNodeQuestion && (
            <>
              {/* Tab bar */}
              <div className={styles.tabBar} role="tablist" aria-label="Metadata sections">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    role="tab"
                    type="button"
                    className={[
                      styles.tab,
                      activeTab === tab.key ? styles.tabActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-selected={activeTab === tab.key}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div
                className={styles.tabContent}
                role="tabpanel"
                aria-label={TABS.find((t) => t.key === activeTab)?.label}
              >
                {formConfig && formConfig.length > 0 ? (
                  <SparkMetaForm
                    fields={formConfig}
                    values={activeNodeMeta as Record<string, unknown>}
                    onChange={handleFormChange}
                    onValidityChange={handleFormValidityChange}
                    readOnly={isReadOnly}
                    section={tabSection(activeTab)}
                  />
                ) : (
                  <p className={styles.emptyState}>No fields configured for this node type.</p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ContextualEditor;
