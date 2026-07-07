import { useState } from 'react';
import { Icon } from '../shared/Icon';
import SharedRichToolbar from '../shared/SharedRichToolbar';
import ContentEditable from '../shared/ContentEditable';
import { useQuestionStore } from '../../store/question.store';
import { useSaveQuestion } from '../../hooks/useSaveQuestion';
import { useEditorStore } from '../../store/editor.store';
import { getUserId, isEditingAllowed } from '../../utils/context';
import { labelFrom } from '../../utils/labels';
import { useLabels } from '../../hooks/useLabels';
import SparkMetaForm from '../SparkMetaForm/SparkMetaForm';
import { useFramework } from '../../hooks/useFramework';
import ImagePickerModal from '../shared/ImagePickerModal';
import { lazy, Suspense } from 'react';
import { useTreeStore } from '../../store/tree.store';
import { getContentId } from '../../utils/context';

const QumlPlayer = lazy(() => import('../QumlPlayer/QumlPlayer'));
import { createPortal } from 'react-dom';
import type { EditorMode } from '../../types/editor';
import type { QuestionType } from '../../types/question';
import { resolveQuestionType } from '../../registry';


export interface QuestionEditorProps {
  editorMode: EditorMode;
  onBack?: () => void;
}

// Type-specific stem hint text
const STEM_HINT: Record<QuestionType, string> = {
  mcq: 'Rich text, images & equations supported',
  sa:  'Rich text, images & equations supported',
  ftb: 'Wrap the answer in [[ ]] to mark a blank',
  mtf: 'Rich text, images & equations supported',
  seq: 'Rich text, images & equations supported',
  reo: 'Rich text, images & equations supported',
  boolean: 'Rich text, images & equations supported',
};

// ---------------------------------------------------------------------------
// ConfigBlock — partial scoring / any-order toggles
// ---------------------------------------------------------------------------

function ConfigBlock({ type }: { type: QuestionType | null }) {
  const partial     = useQuestionStore((s) => s.isPartialScore);
  const anyOrder    = useQuestionStore((s) => s.evalUnordered);
  const setPartial  = useQuestionStore((s) => s.setIsPartialScore);
  const setAnyOrder = useQuestionStore((s) => s.setEvalUnordered);
  const L = useLabels();
  const hasPartial  = type === 'seq' || type === 'ftb' || type === 'mtf';
  const hasAnyOrder = type === 'ftb';
  if (!hasPartial && !hasAnyOrder) return null;

  return (
    <div className="ce-cfg">
      <div className="ce-cfg-ttl">{L('ui.configuration', 'Configuration')}</div>
      {hasPartial && (
        <label className="ce-cfg-row" onClick={() => setPartial(!partial)}>
          <input type="checkbox" className="sb-check" checked={partial} readOnly />
          <span className="t">
            {L('ui.partialScoring', 'Partial scoring')}
            <em>{L('ui.partialScoringDesc', 'Award marks for each correct response, not all-or-nothing')}</em>
          </span>
        </label>
      )}
      {hasAnyOrder && (
        <label className="ce-cfg-row" onClick={() => setAnyOrder(!anyOrder)}>
          <input type="checkbox" className="sb-check" checked={anyOrder} readOnly />
          <span className="t">
            {L('ui.anyOrder', 'Allow answers in any order')}
            <em>{L('ui.anyOrderDesc', 'Blanks are evaluated without regard to position')}</em>
          </span>
        </label>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HintBlock — optional question-level hint (old editor: hints[uuid] = {en})
// ---------------------------------------------------------------------------

function HintBlock() {
  const hintText = useQuestionStore((st) => st.hintText);
  const setHintText = useQuestionStore((st) => st.setHintText);
  const L = useLabels();
  const [open, setOpen] = useState(false);

  if (!open && !hintText) {
    return (
      <button type="button" className="ce-sol-add" onClick={() => setOpen(true)}>
        <span className="ic"><Icon name="plus" size={17} /></span>
        <span className="tx">
          <b>{L('ui.addHint', 'Add a hint')}</b>
          <em>{L('ui.addHintDesc', 'Optional — a nudge shown to learners on request')}</em>
        </span>
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--sb-bg-warm)', border: '1px solid var(--sb-border-soft)',
      borderRadius: 18, padding: '20px 24px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Icon name="info" size={18} style={{ color: 'var(--accent-deep)', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{L('ui.hint', 'Hint')}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
          border: '1.5px solid var(--sb-border)', borderRadius: 999, padding: '3px 10px',
          color: 'var(--sb-text-muted)', background: '#fff',
        }}>{L('ui.optional', 'Optional')}</span>
        <button type="button" onClick={() => { setHintText(''); setOpen(false); }} title="Remove hint"
          style={{ marginInlineStart: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--sb-text-faint)', display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 8 }}>
          <Icon name="x" size={18} />
        </button>
      </div>
      <ContentEditable
        value={hintText}
        onChange={setHintText}
        placeholder={L('ui.hintPh', 'Write a hint that points learners toward the answer…')}
        minHeight={60}
        bodyClass="stem-field"
        disabled={false}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SolutionBlock — optional solution with Text/Video/Audio
// ---------------------------------------------------------------------------

function SolutionBlock() {
  const solutionType    = useQuestionStore((st) => st.solutionType);
  const solutionText    = useQuestionStore((st) => st.solutionText);
  const solutionAsset   = useQuestionStore((st) => st.solutionAsset);
  const setSolutionType = useQuestionStore((st) => st.setSolutionType);
  const setSolutionText = useQuestionStore((st) => st.setSolutionText);
  const setSolutionAsset = useQuestionStore((st) => st.setSolutionAsset);
  const clearSolution   = useQuestionStore((st) => st.clearSolution);
  const L = useLabels();

  const editorConfig = useEditorStore((st) => st.editorConfig);
  const channel = editorConfig?.context?.channel ?? '';
  const userId = getUserId(editorConfig?.context);

  const [browserOpen, setBrowserOpen] = useState(false);

  const kind = solutionType === '' ? null : solutionType;

  if (!kind) {
    return (
      <button type="button" className="ce-sol-add" onClick={() => setSolutionType('html')}>
        <span className="ic"><Icon name="plus" size={17} /></span>
        <span className="tx">
          <b>{L('ui.addSolution', 'Add a solution')}</b>
          <em>{L('ui.addSolutionDesc', 'Optional — explain the answer with text, video or audio')}</em>
        </span>
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--sb-bg-warm)', border: '1px solid var(--sb-border-soft)',
      borderRadius: 18, padding: '20px 24px 22px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Icon name="info" size={18} style={{ color: 'var(--accent-deep)', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{L('ui.solution', 'Solution')}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
          border: '1.5px solid var(--sb-border)', borderRadius: 999, padding: '3px 10px',
          color: 'var(--sb-text-muted)', background: '#fff',
        }}>{L('ui.optional', 'Optional')}</span>
        <button type="button" onClick={clearSolution} title="Remove solution"
          style={{ marginInlineStart: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--sb-text-faint)', display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 8 }}>
          <Icon name="x" size={18} />
        </button>
      </div>

      {/* Type tabs — html (Text+Image) / video / audio, like the old editor */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {([
          ['html', L('ui.textImage', 'Text + Image'), 'image'],
          ['video', L('ui.video', 'Video'), 'video'],
          ['audio', L('ui.audio', 'Audio'), 'link'],
        ] as const).map(([k, label, icon]) => {
          const active = kind === k;
          return (
            <button key={k} type="button" onClick={() => { if (!active) setSolutionType(k); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12, fontFamily: 'inherit',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all .14s',
                background: active ? 'var(--accent)' : '#fff',
                border: `1.5px solid ${active ? 'var(--accent)' : 'var(--sb-border)'}`,
                color: active ? '#fff' : 'var(--sb-text-2)',
              }}>
              <Icon name={icon} size={16} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {kind === 'html' && (
        <ContentEditable
          value={solutionText}
          onChange={setSolutionText}
          placeholder={L('ui.solutionPh', 'Explain the answer — add text, images or equations…')}
          minHeight={90}
          bodyClass="stem-field"
          disabled={false}
        />
      )}
      {(kind === 'video' || kind === 'audio') && (
        solutionAsset ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid var(--sb-border)', borderRadius: 12, padding: '12px 16px' }}>
            {solutionAsset.thumbnail
              ? <img src={solutionAsset.thumbnail} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8 }} />
              : <Icon name={kind === 'video' ? 'video' : 'link'} size={22} style={{ color: 'var(--sb-text-muted)' }} />}
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {solutionAsset.name}
            </span>
            <button type="button" className="ce-btn ghost" onClick={() => setBrowserOpen(true)}>{L('ui.change', 'Change')}</button>
            <button type="button" className="ce-btn ghost" onClick={() => setSolutionAsset(null)} title="Remove">
              <Icon name="trash" size={15} />
            </button>
          </div>
        ) : (
          <button type="button" className="ce-sol-drop" onClick={() => setBrowserOpen(true)}
            style={{ cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
            <Icon name={kind === 'video' ? 'video' : 'link'} size={26} />
            <span>{kind === 'video'
              ? L('ui.chooseVideo', 'Choose a video from the library or upload one')
              : L('ui.chooseAudio', 'Choose an audio from the library or upload one')}</span>
          </button>
        )
      )}

      {browserOpen && (kind === 'video' || kind === 'audio') && (
        <ImagePickerModal
          mediaType={kind}
          onClose={() => setBrowserOpen(false)}
          onSelect={(url, asset) => {
            const id = asset?.id || url.match(/(do_[A-Za-z0-9]+)/)?.[1] || '';
            const name = asset?.name || url.split('/').pop() || id;
            setSolutionAsset({ id, src: url, name, thumbnail: asset?.thumbnail });
            setBrowserOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main QuestionEditor
// ---------------------------------------------------------------------------


export default function QuestionEditor({ editorMode, onBack }: QuestionEditorProps) {
  const {
    questionType, questionBody, setQuestionBody, isSaving,
    options, matchPairs, sequence, answerText, sentence,
  } = useQuestionStore();
  const { save } = useSaveQuestion();

  const uiLabels = useEditorStore((st) => st.labels);
  const L = (path: string, fallback: string) => labelFrom(uiLabels, path, fallback);

  const editorConfigCtx = useEditorStore.getState().editorConfig?.context;
  const isReadOnly = !isEditingAllowed(editorMode, editorConfigCtx);
  const type = questionType as QuestionType | null;
  const typeDef = resolveQuestionType(type);
  const typeLabel = typeDef
    ? L(typeDef.labelKey, typeDef.label)
    : L('ui.question', 'Question');
  const typeIcon  = typeDef?.icon ?? 'help';
  const stemHint = type
    ? (type === 'ftb'
        ? L('ui.ftbHint', STEM_HINT.ftb)
        : L('ui.richTextHint', STEM_HINT[type] ?? ''))
    : '';

  // Required-field validation per type — Save is disabled until the question
  // stem and all answer inputs are filled (config toggles/solution excluded).
  // An image counts as content (image-only stems/options are valid).
  const plain = (html?: string) => {
    const text = (html ?? '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text || (/<(img|figure)\b/i.test(html ?? '') ? '[image]' : '');
  };
  // Validation runs against the PRIMARY language (en) — other languages are
  // optional translations (old editor semantics). When editing a non-en
  // language, the en text lives in the i18n maps.
  const contentLang = useQuestionStore((st) => st.contentLang);
  const i18nText = useQuestionStore((st) => st.i18nText);
  const enOf = (map: Record<string, string> | undefined, current: string) =>
    contentLang === 'en' ? current : (map?.en ?? '');
  
  // Details form (childMetadata) — writes into the tree node like the tab did.
  const questionFormConfig = useEditorStore((st) => st.questionFormConfig);
  const activeNodeMeta = useTreeStore((st) => st.activeNodeMeta);
  const updateNode = useTreeStore((st) => st.updateNode);
  const detailNodeId = useTreeStore((st) => st.selectedNodeId);
  const { frameworkTerms } = useFramework();
  const handleDetailChange = (code: string, value: unknown) => {
    if (detailNodeId) updateNode(detailNodeId, { [code]: value });
  };
  // board/medium/gradeLevel/subject/audience are no longer inherited from
  // the question set — each question leaves them unset until chosen explicitly.
  const detailValues = (activeNodeMeta as Record<string, unknown>) ?? {};

  // Required-field validity of the Details (childMetadata) form below —
  // gates Save so questions can't reach review with missing metadata.
  const [detailsValid, setDetailsValid] = useState(true);

  const invalidReason = (() => {
    const qBody = enOf(i18nText.questionBody, questionBody);
    if (!plain(qBody)) return 'Enter the question first (in EN)';
    if (!plain(questionBody)) return 'Enter the question first';
    // Title and Marks come from the Details section — no defaults.
    if (!String((activeNodeMeta?.name as string) ?? '').trim()) {
      return 'Enter the title in Details';
    }
    if ((type === 'mcq' || type === 'sa') && !(Number(activeNodeMeta?.maxScore) > 0)) {
      return 'Enter the marks in Details';
    }
    if (!detailsValid) return 'Fill all required fields in Details';
    switch (type) {
      case 'mcq':
      case 'boolean':
        if (options.some((o) => !plain(enOf(i18nText.options[o.id], o.body)))) return 'Fill in all options (in EN)';
        if (!options.some((o) => o.isCorrect)) return 'Mark one option as the correct answer';
        return null;
      case 'ftb':
        if (!/\[\[.+?\]\]/.test(qBody)) return 'Add at least one [[blank]] with its answer';
        return null;
      case 'sa':
        if (!plain(enOf(i18nText.answerText, answerText))) return 'Enter the answer (in EN)';
        return null;
      case 'mtf':
        if (
          matchPairs.length < 2 ||
          matchPairs.some((p) => !plain(enOf(i18nText.pairsLeft[p.id], p.left)) || !plain(enOf(i18nText.pairsRight[p.id], p.right)))
        ) {
          return 'Fill in all matching pairs (in EN)';
        }
        return null;
      case 'seq':
        if (sequence.length < 2 || sequence.some((s, i) => !plain(enOf(i18nText.sequence[i], s)))) {
          return 'Fill in all sequence items (in EN)';
        }
        return null;
      case 'reo':
        if (plain(enOf(i18nText.sentence, sentence)).split(/\s+/).filter(Boolean).length < 2) {
          return 'Enter a sentence with at least two words (in EN)';
        }
        return null;
      default:
        return null;
    }
  })();

  const isDirty = useQuestionStore((st) => st.isDirty);
  const activeQuestion = useQuestionStore((st) => st.activeQuestion);
  const [confirmBackOpen, setConfirmBackOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const selectedNodeId = useTreeStore((st) => st.selectedNodeId);

  // Old editor shows a confirmation before leaving an unsaved question.
  const handleBack = () => {
    const isUnsavedNew = !!activeQuestion?.identifier?.startsWith('temp-');
    if (!isReadOnly && (isDirty || isUnsavedNew)) setConfirmBackOpen(true);
    else onBack?.();
  };
  // Leaving a never-saved question discards it — the temp node must not stay
  // in the tree (a later hierarchy save would create an empty question).
  const discardAndBack = () => {
    setConfirmBackOpen(false);
    if (activeQuestion?.identifier?.startsWith('temp-')) {
      useTreeStore.getState().deleteNode(activeQuestion.identifier);
    }
    onBack?.();
  };
  // Navigate back to the set only when the creation/update succeeded.
  const handleSave = async () => { if (await save()) onBack?.(); };

  return (
    <div className="ce-ed">
      <button className="ce-ed-back" type="button" onClick={handleBack}>
        <Icon name="arrow-left" size={16} />{L('ui.backToSet', 'Back to set')}
      </button>

      <div className="ce-ed-card">
        {/* Header — type badge */}
        <div className="ce-ed-head">
          <span className="badge">
            <Icon name={typeIcon} size={15} />
            {typeLabel}
          </span>
        </div>

        {/* Shared toolbar — sticky inside the card */}
        <div className="ce-ed-toolbar">
          <SharedRichToolbar disabled={isReadOnly} />
        </div>

        {/* Body */}
        <div className="ce-ed-body">

          {/* Question stem */}
          <div className="ce-ed-sec ce-ed-stem">
            <div className="ce-ed-lbl">
              {L('ui.question', 'Question')}
              <span className="hint">{stemHint}</span>
            </div>
            <ContentEditable
              value={questionBody}
              onChange={setQuestionBody}
              placeholder={type === 'ftb'
                ? L('ui.ftbPh', 'e.g. The capital of France is [[Paris]]')
                : L('ui.questionPh', 'Type the question here…')}
              minHeight={70}
              disabled={isReadOnly}
              bodyClass="stem-field"
            />
            {type === 'ftb' && (
              <p className="ce-ftb-help">
                {L('ui.ftbHelp', 'Use square brackets [[ ]] to indicate blanks. The text inside becomes the correct answer.')}
              </p>
            )}
          </div>

          {/* Per-type answer section — component resolved from the registry */}
          {typeDef && <typeDef.Editor readOnly={isReadOnly} stemText={questionBody} />}

          {/* Config */}
          <ConfigBlock type={type} />

          {/* Hint */}
          {!isReadOnly && <HintBlock />}

          {/* Solution */}
          {!isReadOnly && <SolutionBlock />}

          {/* Details — question metadata (childMetadata form) authored here;
              the Details tab outside the editor is read-only */}
          {questionFormConfig && questionFormConfig.length > 0 && (
            <div className="ce-ed-sec">
              <div className="ce-ed-lbl">{L('ui.details', 'Details')}</div>
              <SparkMetaForm
                fields={questionFormConfig.map((f) => ({ ...f, editable: true }))}
                values={detailValues}
                onChange={handleDetailChange}
                onValidityChange={setDetailsValid}
                readOnly={isReadOnly}
                frameworkTerms={frameworkTerms}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="ce-ed-foot">
          <div className="grow" />
          <button
            type="button"
            className="ce-btn ghost"
            onClick={() => setPreviewOpen(true)}
            disabled={!!invalidReason}
            title={invalidReason ?? 'Preview this question'}
          >
            {L('button_labels.preview_question_btn_label', 'Preview')}
          </button>
          <button type="button" className="ce-btn ghost" onClick={handleBack}>
            {L('button_labels.cancel_question_btn_label', 'Cancel')}
          </button>
          {!isReadOnly && (
            <button
              type="button"
              className="ce-btn primary"
              onClick={handleSave}
              disabled={isSaving || !!invalidReason}
              title={invalidReason ?? undefined}
            >
              <Icon name="check" size={16} />
              {isSaving ? 'Saving…' : L('button_labels.save_question_btn_label', 'Save question')}
            </button>
          )}
        </div>
      </div>

      {/* Single-question preview (old editor question.component.previewContent) */}
      {previewOpen && (
        <Suspense fallback={null}>
          <QumlPlayer
            questionSetId={getContentId(editorConfigCtx)}
            singleQuestionId={selectedNodeId ?? undefined}
            onClose={() => setPreviewOpen(false)}
          />
        </Suspense>
      )}

      {/* Back confirmation — old editor's confirmQuestionNotSaved; same
          portal/card pattern as ConfirmDialog so popups look identical */}
      {confirmBackOpen && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, fontFamily: 'var(--sb-font)',
          }}
          onMouseDown={e => { if (e.target === e.currentTarget) setConfirmBackOpen(false); }}
        >
          <div
            style={{
              background: 'var(--sb-card)', borderRadius: 18,
              width: 480, maxWidth: '100%',
              display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--sb-shadow-deep)', overflow: 'hidden',
            }}
            onMouseDown={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px 16px' }}>
              <span style={{ fontWeight: 800, fontSize: 18, flex: 1, color: 'var(--sb-text)' }}>
                {L('ui.unsavedQuestion', 'Unsaved question')}
              </span>
              <button
                type="button"
                onClick={() => setConfirmBackOpen(false)}
                style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  padding: 4, borderRadius: 6, color: 'var(--sb-text-muted)',
                  display: 'grid', placeItems: 'center',
                }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              <p style={{ fontSize: 15, color: 'var(--sb-text-2)', lineHeight: 1.6, margin: 0 }}>
                {L('lbl.confirmQuestionNotSaved', 'This question will not be saved, are you sure you want to go back to questionset?')}
              </p>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              padding: '16px 24px', borderTop: '1px solid var(--sb-border)',
            }}>
              <button type="button" className="ce-btn ghost" onClick={() => setConfirmBackOpen(false)}>
                {L('button_labels.no_btn_label', 'No')}
              </button>
              <button type="button" className="ce-btn danger" onClick={discardAndBack}>
                {L('button_labels.yes_btn_label', 'Yes, go back')}
              </button>
            </div>
          </div>
        </div>,
        document.querySelector('.ce') ?? document.body,
      )}
    </div>
  );
}
