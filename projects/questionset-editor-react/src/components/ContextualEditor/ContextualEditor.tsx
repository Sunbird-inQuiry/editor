import React, { useState, useCallback, useEffect, lazy, Suspense, Fragment } from 'react';
import ImagePickerModal from '../shared/ImagePickerModal';
import { Icon } from '../shared/Icon';
import type { EditorMode, ToolbarAction } from '../../types/editor';
import { QUESTION_TYPE_LABELS, type QuestionType } from '../../types/question';
import { useEditorStore } from '../../store/editor.store';
import { useTreeStore } from '../../store/tree.store';
import { useQuestionStore } from '../../store/question.store';
import { useUiStore } from '../../store/ui.store';
import { isEditingAllowed } from '../../utils/context';
import { telemetryImpression } from '../../utils/telemetry';
import { useFramework } from '../../hooks/useFramework';
import { useQuestionRead } from '../../hooks/useQuestionRead';
import { useLabels } from '../../hooks/useLabels';
import SparkMetaForm from '../SparkMetaForm/SparkMetaForm';
import QuestionDetail from '../QuestionDetail/QuestionDetail';

const QuestionEditor = lazy(() => import('../QuestionEditor/QuestionEditor'));
const QumlPlayer    = lazy(() => import('../QumlPlayer/QumlPlayer'));

const QUESTION_TYPE_ICON: Record<string, string> = {
  mcq: 'check',
  sa:  'doc',
  ftb: 'edit-sm',
  mtf: 'link',
  seq: 'numlist',
  reo: 'swap',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContextualEditorProps {
  editorMode?: EditorMode;
  onToolbarEvent: (event: { action: ToolbarAction; data?: unknown }) => void;
  hasContent?: boolean;
}

type TabKey = 'details' | 'audience' | 'behaviour' | 'question' | 'meta';

interface TabDef { key: TabKey; label: string; section?: string; }

const SET_TABS: TabDef[] = [
  { key: 'details', label: 'Details' },
  { key: 'audience', label: 'Audience & Curriculum', section: 'Audience & Curriculum' },
  { key: 'behaviour', label: 'Behaviour' },
];
const SECTION_TABS: TabDef[] = [
  { key: 'details', label: 'Details' },
  { key: 'behaviour', label: 'Behaviour' },
];
const QUESTION_TABS: TabDef[] = [
  { key: 'question', label: 'Question' },
  { key: 'meta', label: 'Details' },
];

function PanelSpinner() {
  return (
    <div className="ce-spinner-wrap">
      <span className="ce-spinner" aria-hidden="true" />
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
  const { frameworkTerms } = useFramework();
  const L = useLabels();
  // Hydrate the selected question from question/v2/read (old-editor parity —
  // hierarchy responses don't embed editorState/options/solutions).
  const { isFetching: isQuestionLoading } = useQuestionRead();

  const storeEditorMode = useEditorStore((s) => s.editorMode);
  const showPreview = useEditorStore((s) => s.showPreview);
  const isCurrentNodeRoot = useEditorStore((s) => s.isCurrentNodeRoot);
  const isCurrentNodeFolder = useEditorStore((s) => s.isCurrentNodeFolder);
  const isCurrentNodeQuestion = useEditorStore((s) => s.isCurrentNodeQuestion);
  const rootFormConfig = useEditorStore((s) => s.rootFormConfig);
  const unitFormConfig = useEditorStore((s) => s.unitFormConfig);
  const relationalFormConfig = useEditorStore((s) => s.relationalFormConfig);
  const questionFormConfig = useEditorStore((s) => s.questionFormConfig);

  const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
  const activeNodeMeta = useTreeStore((s) => s.activeNodeMeta);
  const breadcrumb = useTreeStore((s) => s.breadcrumb);
  const updateNode = useTreeStore((s) => s.updateNode);
  const selectNode = useTreeStore((s) => s.selectNode);

  const { openModal, pendingEditorOpen, setPendingEditorOpen } = useUiStore();

  const editorMode = editorModeProp ?? storeEditorMode;
  // Old editor: forms editable only in edit mode, or during org/sourcing
  // review when the host allows reviewer modifications.
  const editorConfigCtx = useEditorStore.getState().editorConfig?.context;
  const isReadOnly = !isEditingAllowed(editorMode, editorConfigCtx);

  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const [inlineEditorOpen, setInlineEditorOpen] = useState(false);
  const setQuestionEditorOpen = useUiStore((st) => st.setQuestionEditorOpen);

  // Lock hierarchy + topbar while the inline question editor is open.
  useEffect(() => {
    setQuestionEditorOpen(isCurrentNodeQuestion && inlineEditorOpen);
    if (isCurrentNodeQuestion && inlineEditorOpen) telemetryImpression('question_editor');
    return () => setQuestionEditorOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentNodeQuestion, inlineEditorOpen]);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // Reset state on node change
  // Also auto-open inline editor if this node was just created via type picker
  useEffect(() => {
    // A question save swaps node ids (temp → uuid → do_), which changes
    // selectedNodeId mid-save — keep the editor open until save completes.
    if (useQuestionStore.getState().isSaving) return;

    setActiveTab(isCurrentNodeQuestion ? 'question' : 'details');

    if (selectedNodeId && selectedNodeId === pendingEditorOpen) {
      setInlineEditorOpen(true);
      setPendingEditorOpen(null);
    } else {
      setInlineEditorOpen(false);
    }
  }, [selectedNodeId, isCurrentNodeQuestion]);

  const handleFormChange = useCallback((code: string, value: unknown) => {
    if (!selectedNodeId) return;
    // Pass the field directly — do NOT nest inside metadata:{} which would
    // produce a "metadata.metadata" property that the backend rejects.
    updateNode(selectedNodeId, { [code]: value });
    onToolbarEvent({ action: 'onFormValueChange', data: { field: code, value } });
  }, [selectedNodeId, updateNode, onToolbarEvent]);

  const handleFormValidityChange = useCallback((isValid: boolean) => {
    onToolbarEvent({ action: 'onFormStatusChange', data: { isValid } });
  }, [onToolbarEvent]);

  const licenses = useEditorStore((s) => s.licenses);
  // Old meta-form fills the license field's options from getLicenses().
  const withLicenseOptions = useCallback(
    (fields: typeof rootFormConfig) =>
      (fields ?? []).map((f) =>
        f.code === 'license' && !f.range && licenses.length ? { ...f, range: licenses } : f),
    [licenses],
  );

  const formConfig = isCurrentNodeRoot ? rootFormConfig : unitFormConfig;
  const nodeTabs = isCurrentNodeQuestion ? QUESTION_TABS : isCurrentNodeRoot ? SET_TABS : SECTION_TABS;

  // Meta subtitle
  const metaSubtitle = (() => {
    if (!activeNodeMeta) return '';
    const m = activeNodeMeta as Record<string, unknown>;
    if (isCurrentNodeRoot) {
      const pc = (m.primaryCategory as string) ?? '';
      const grade = (m.gradeLevel as string[])?.[0] ?? '';
      const subject = (m.subject as string[])?.[0] ?? '';
      return [pc, [grade, subject].filter(Boolean).join(' ')].filter(Boolean).join(' · ');
    }
    if (isCurrentNodeFolder) {
      const node = useTreeStore.getState().getNodeById(selectedNodeId ?? '');
      const count = node?.children?.length ?? 0;
      return `${count} question${count === 1 ? '' : 's'}`;
    }
    if (isCurrentNodeQuestion) {
      const qType = (m.questionType as string) ?? '';
      const typeLabel = QUESTION_TYPE_LABELS[qType as QuestionType] ?? qType.toUpperCase();
      const score = (m.maxScore as number) ?? 1;
      // Get parent section name from breadcrumb (second-to-last item)
      const sectionName = breadcrumb.length >= 2 ? breadcrumb[breadcrumb.length - 2]?.name : '';
      return [typeLabel, sectionName, `${score} mark${score === 1 ? '' : 's'}`].filter(Boolean).join(' · ');
    }
    return '';
  })();

  const nothingSelected = !selectedNodeId;
  const noContent = !hasContent;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>

      {/* Preview overlay */}
      {showPreview && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 300, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <Suspense fallback={<PanelSpinner />}>
            <QumlPlayer questionSetId={selectedNodeId ?? ''} onClose={() => onToolbarEvent({ action: 'preview' })} />
          </Suspense>
        </div>
      )}

      {/* Empty / no-selection state */}
      {(noContent || nothingSelected) && !showPreview && (
        <div className="ce-empty" aria-live="polite">
          {noContent ? 'Add a section or question to get started.' : 'Select a node from the outline'}
        </div>
      )}

      {/* Inline question editor — replaces the card entirely */}
      {!nothingSelected && !noContent && !showPreview && isCurrentNodeQuestion && inlineEditorOpen && (
        <div className="ce-main-scroll">
          <Suspense fallback={<PanelSpinner />}>
            <QuestionEditor
              editorMode={editorMode}
              onBack={() => setInlineEditorOpen(false)}
            />
          </Suspense>
        </div>
      )}

      {/* Main content — card view */}
      {!nothingSelected && !noContent && !showPreview && !(isCurrentNodeQuestion && inlineEditorOpen) && (
        <>
          {/* Breadcrumb */}
          {breadcrumb.length > 0 && (
            <nav className="ce-crumb" aria-label="Node path">
              <button onClick={() => selectNode(breadcrumb[0]?.id ?? '')} title="Home">
                <Icon name="home" size={15} />
              </button>
              {breadcrumb.map((crumb, i) => {
                const isLast = i === breadcrumb.length - 1;
                return (
                  <React.Fragment key={crumb.id}>
                    <span className="sep"><Icon name="caret-right" size={13} /></span>
                    {isLast
                      ? <span className="cur">{crumb.name}</span>
                      : <button onClick={() => selectNode(crumb.id)}>{crumb.name}</button>}
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          {/* Card */}
          <div className="ce-main-scroll">
            <div className="ce-card">
              {/* Card header */}
              <div className="ce-card-head">
                {isCurrentNodeRoot && (
                  <>
                    <button
                      type="button"
                      className="ce-thumb"
                      title={isReadOnly ? undefined : 'Click to change icon'}
                      onClick={() => !isReadOnly && setIconPickerOpen(true)}
                      style={{ cursor: isReadOnly ? 'default' : 'pointer' }}
                    >
                      {activeNodeMeta?.appIcon ? (
                        <img src={activeNodeMeta.appIcon as string} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                      ) : (
                        <Icon name="image" size={28} />
                      )}
                    </button>
                    {iconPickerOpen && (
                      <ImagePickerModal
                        onSelect={(url) => {
                          if (selectedNodeId) handleFormChange('appIcon', url);
                          setIconPickerOpen(false);
                        }}
                        onClose={() => setIconPickerOpen(false)}
                      />
                    )}
                  </>
                )}
                {isCurrentNodeFolder && !isCurrentNodeRoot && (
                  <div className="ce-thumb folder">
                    <Icon name="folder" size={28} />
                  </div>
                )}
                {isCurrentNodeQuestion && (() => {
                  const qType = (activeNodeMeta?.questionType as string)
                    ?? (activeNodeMeta?.metadata as Record<string,unknown>)?.questionType as string
                    ?? '';
                  const iconName = QUESTION_TYPE_ICON[qType] ?? 'help';
                  return (
                    <div className="ce-thumb question">
                      <Icon name={iconName} size={26} />
                    </div>
                  );
                })()}
                <div style={{ minWidth: 0 }}>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(activeNodeMeta?.name as string) || 'Untitled'}
                  </h1>
                  {metaSubtitle && <p className="sub">{metaSubtitle}</p>}
                </div>
              </div>

              {/* Tab bar */}
              <div className="ce-tabs" role="tablist">
                {nodeTabs.map(tab => (
                  <button
                    key={tab.key}
                    role="tab"
                    type="button"
                    className={`ce-tab${activeTab === tab.key ? ' on' : ''}`}
                    aria-selected={activeTab === tab.key}
                    onClick={() => { setActiveTab(tab.key); setInlineEditorOpen(false); }}
                  >
                    {L(`ui.${tab.key}`, tab.label)}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div role="tabpanel">

                {/* ── Question: preview tab ── */}
                {isCurrentNodeQuestion && activeTab === 'question' && (
                  <div className="ce-qdetail">
                    <QuestionDetail
                      isLoading={isQuestionLoading}
                      node={useTreeStore.getState().getNodeById(selectedNodeId ?? '') ?? { id: selectedNodeId ?? '', identifier: selectedNodeId ?? '', name: '' }}
                      onOpenEditor={() => setInlineEditorOpen(true)}
                      onRemove={() => openModal('confirmDelete', { nodeId: selectedNodeId })}
                      isEditMode={editorMode === 'edit'}
                    />
                  </div>
                )}

                {/* ── Question: meta/details tab — read-only view; details are
                     authored inside the question editor's Details section ── */}
                {isCurrentNodeQuestion && activeTab === 'meta' && (
                  <div className="ce-tabbody">
                    <SparkMetaForm
                      fields={withLicenseOptions(questionFormConfig ?? relationalFormConfig)}
                      values={activeNodeMeta as Record<string, unknown>}
                      onChange={handleFormChange}
                      onValidityChange={handleFormValidityChange}
                      readOnly
                      frameworkTerms={frameworkTerms}
                    />
                  </div>
                )}

                {/* ── Set/Section: details tab ── */}
                {!isCurrentNodeQuestion && activeTab === 'details' && (
                  <div className="ce-tabbody">
                    {isCurrentNodeRoot && (
                      <>
                        <h2 className="ce-secttl">Set Details</h2>
                        <p className="ce-sectsub">Name, description and instructions shown before the set begins.</p>
                      </>
                    )}
                    {isCurrentNodeFolder && !isCurrentNodeRoot && (
                      <>
                        <h2 className="ce-secttl">Section Details</h2>
                        <p className="ce-sectsub">Title and instructions for this section.</p>
                      </>
                    )}
                    {formConfig && formConfig.length > 0 ? (
                      <SparkMetaForm
                        fields={withLicenseOptions(formConfig)}
                        values={activeNodeMeta as Record<string, unknown>}
                        onChange={handleFormChange}
                        onValidityChange={handleFormValidityChange}
                        readOnly={isReadOnly}
                        section="Details"
                        frameworkTerms={frameworkTerms}
                      />
                    ) : (
                      <p className="ce-empty" style={{ flex: 'none', padding: '16px 0' }}>No fields configured.</p>
                    )}
                  </div>
                )}

                {/* ── Set: audience & curriculum tab ── */}
                {isCurrentNodeRoot && activeTab === 'audience' && (
                  <div className="ce-tabbody">
                    <h2 className="ce-secttl">Target Audience</h2>
                    <p className="ce-sectsub">Curriculum alignment for the intended learners.</p>
                    <SparkMetaForm
                      fields={withLicenseOptions(formConfig)}
                      values={activeNodeMeta as Record<string, unknown>}
                      onChange={handleFormChange}
                      onValidityChange={handleFormValidityChange}
                      readOnly={isReadOnly}
                      section="Audience & Curriculum"
                      frameworkTerms={frameworkTerms}
                    />
                  </div>
                )}

                {/* ── Set/Section: behaviour tab (data-driven from category definition) ── */}
                {!isCurrentNodeQuestion && activeTab === 'behaviour' && (
                  <div className="ce-tabbody">
                    {isCurrentNodeRoot && (
                      <>
                        <h2 className="ce-secttl">Behaviour & Scoring</h2>
                        <p className="ce-sectsub">How the set is timed, attempted and summarised.</p>
                      </>
                    )}
                    {isCurrentNodeFolder && !isCurrentNodeRoot && (
                      <>
                        <h2 className="ce-secttl">Section Behaviour</h2>
                        <p className="ce-sectsub">Controls applied to this section inside the set.</p>
                      </>
                    )}
                    <SparkMetaForm
                      fields={withLicenseOptions(formConfig)}
                      values={activeNodeMeta as Record<string, unknown>}
                      onChange={handleFormChange}
                      onValidityChange={handleFormValidityChange}
                      readOnly={isReadOnly}
                      section="Behaviour"
                      frameworkTerms={frameworkTerms}
                    />
                  </div>
                )}

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContextualEditor;
