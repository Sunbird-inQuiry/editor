import React, { useState } from 'react';
import { Icon } from '../shared/Icon';
import SharedRichToolbar from '../shared/SharedRichToolbar';
import ContentEditable from '../shared/ContentEditable';
import { useQuestionStore } from '../../store/question.store';
import { useSaveQuestion } from '../../hooks/useSaveQuestion';
import { useEditorStore } from '../../store/editor.store';
import { getUserId } from '../../utils/context';
import ImagePickerModal from '../shared/ImagePickerModal';
import type { EditorMode } from '../../types/editor';
import { QUESTION_TYPE_LABELS, type QuestionType } from '../../types/question';
import McqEditor from './McqEditor/McqEditor';
import SaEditor from './SaEditor/SaEditor';
import FtbEditor from './FtbEditor/FtbEditor';
import MtfEditor from './MtfEditor/MtfEditor';
import SeqEditor from './SeqEditor/SeqEditor';
import ReoEditor from './ReoEditor/ReoEditor';


export interface QuestionEditorProps {
  editorMode: EditorMode;
  onBack?: () => void;
}

// Type-specific icon and hint text
const TYPE_ICON: Record<QuestionType, string> = {
  mcq: 'check', sa: 'doc', ftb: 'edit-sm', mtf: 'link', seq: 'numlist', reo: 'swap',
};
const STEM_HINT: Record<QuestionType, string> = {
  mcq: 'Rich text, images & equations supported',
  sa:  'Rich text, images & equations supported',
  ftb: 'Wrap the answer in [[ ]] to mark a blank',
  mtf: 'Rich text, images & equations supported',
  seq: 'Rich text, images & equations supported',
  reo: 'Rich text, images & equations supported',
};

// ---------------------------------------------------------------------------
// ConfigBlock — partial scoring / any-order toggles
// ---------------------------------------------------------------------------

function ConfigBlock({ type }: { type: QuestionType | null }) {
  const partial     = useQuestionStore((s) => s.isPartialScore);
  const anyOrder    = useQuestionStore((s) => s.evalUnordered);
  const setPartial  = useQuestionStore((s) => s.setIsPartialScore);
  const setAnyOrder = useQuestionStore((s) => s.setEvalUnordered);
  const hasPartial  = type === 'seq' || type === 'ftb' || type === 'mtf';
  const hasAnyOrder = type === 'ftb';
  if (!hasPartial && !hasAnyOrder) return null;

  return (
    <div className="ce-cfg">
      <div className="ce-cfg-ttl">Configuration</div>
      {hasPartial && (
        <label className="ce-cfg-row" onClick={() => setPartial(!partial)}>
          <input type="checkbox" className="sb-check" checked={partial} readOnly />
          <span className="t">
            Partial scoring
            <em>Award marks for each correct response, not all-or-nothing</em>
          </span>
        </label>
      )}
      {hasAnyOrder && (
        <label className="ce-cfg-row" onClick={() => setAnyOrder(!anyOrder)}>
          <input type="checkbox" className="sb-check" checked={anyOrder} readOnly />
          <span className="t">
            Allow answers in any order
            <em>Blanks are evaluated without regard to position</em>
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
  const [open, setOpen] = useState(false);

  if (!open && !hintText) {
    return (
      <button type="button" className="ce-sol-add" onClick={() => setOpen(true)}>
        <span className="ic"><Icon name="plus" size={17} /></span>
        <span className="tx">
          <b>Add a hint</b>
          <em>Optional — a nudge shown to learners on request</em>
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
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>Hint</span>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
          border: '1.5px solid var(--sb-border)', borderRadius: 999, padding: '3px 10px',
          color: 'var(--sb-text-muted)', background: '#fff',
        }}>Optional</span>
        <button type="button" onClick={() => { setHintText(''); setOpen(false); }} title="Remove hint"
          style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--sb-text-faint)', display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 8 }}>
          <Icon name="x" size={18} />
        </button>
      </div>
      <ContentEditable
        value={hintText}
        onChange={setHintText}
        placeholder="Write a hint that points learners toward the answer…"
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
          <b>Add a solution</b>
          <em>Optional — explain the answer with text, video or audio</em>
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
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>Solution</span>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
          border: '1.5px solid var(--sb-border)', borderRadius: 999, padding: '3px 10px',
          color: 'var(--sb-text-muted)', background: '#fff',
        }}>Optional</span>
        <button type="button" onClick={clearSolution} title="Remove solution"
          style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--sb-text-faint)', display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 8 }}>
          <Icon name="x" size={18} />
        </button>
      </div>

      {/* Type tabs — html (Text+Image) / video / audio, like the old editor */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {([['html', 'Text + Image', 'image'], ['video', 'Video', 'video'], ['audio', 'Audio', 'link']] as const).map(([k, label, icon]) => {
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
          placeholder="Explain the answer — add text, images or equations…"
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
            <button type="button" className="ce-btn ghost" onClick={() => setBrowserOpen(true)}>Change</button>
            <button type="button" className="ce-btn ghost" onClick={() => setSolutionAsset(null)} title="Remove">
              <Icon name="trash" size={15} />
            </button>
          </div>
        ) : (
          <button type="button" className="ce-sol-drop" onClick={() => setBrowserOpen(true)}
            style={{ cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
            <Icon name={kind === 'video' ? 'video' : 'link'} size={26} />
            <span>Choose a {kind} from the library or upload one</span>
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

  const isReadOnly = editorMode === 'read' || editorMode === 'sourcingreview';
  const type = questionType as QuestionType | null;
  const typeLabel = type ? (QUESTION_TYPE_LABELS[type] ?? type) : 'Question';
  const typeIcon  = type ? (TYPE_ICON[type] ?? 'help') : 'help';
  const stemHint  = type ? (STEM_HINT[type] ?? '') : '';

  // Required-field validation per type — Save is disabled until the question
  // stem and all answer inputs are filled (config toggles/solution excluded).
  // An image counts as content (image-only stems/options are valid).
  const plain = (html?: string) => {
    const text = (html ?? '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text || (/<(img|figure)\b/i.test(html ?? '') ? '[image]' : '');
  };
  const invalidReason = (() => {
    if (!plain(questionBody)) return 'Enter the question first';
    switch (type) {
      case 'mcq':
        if (options.some((o) => !plain(o.body))) return 'Fill in all options';
        if (!options.some((o) => o.isCorrect)) return 'Mark one option as the correct answer';
        return null;
      case 'ftb':
        if (!/\[\[.+?\]\]/.test(questionBody)) return 'Add at least one [[blank]] with its answer';
        return null;
      case 'sa':
        if (!plain(answerText)) return 'Enter the answer';
        return null;
      case 'mtf':
        if (matchPairs.length < 2 || matchPairs.some((p) => !plain(p.left) || !plain(p.right))) {
          return 'Fill in all matching pairs';
        }
        return null;
      case 'seq':
        if (sequence.length < 2 || sequence.some((s) => !plain(s))) return 'Fill in all sequence items';
        return null;
      case 'reo':
        if (plain(sentence).split(/\s+/).filter(Boolean).length < 2) return 'Enter a sentence with at least two words';
        return null;
      default:
        return null;
    }
  })();

  const handleBack = () => onBack?.();
  const handleSave = async () => { await save(); onBack?.(); };

  return (
    <div className="ce-ed">
      <button className="ce-ed-back" type="button" onClick={handleBack}>
        <Icon name="arrow-left" size={16} />Back to set
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
              Question stem
              <span className="hint">{stemHint}</span>
            </div>
            <ContentEditable
              value={questionBody}
              onChange={setQuestionBody}
              placeholder={type === 'ftb' ? 'e.g. The capital of France is [[Paris]]' : 'Type the question here…'}
              minHeight={70}
              disabled={isReadOnly}
              bodyClass="stem-field"
            />
            {type === 'ftb' && (
              <p className="ce-ftb-help">
                Use square brackets <code>[[ ]]</code> to indicate blanks. The text inside becomes the correct answer.
              </p>
            )}
          </div>

          {/* Per-type answer section */}
          {type === 'mcq' && <McqEditor readOnly={isReadOnly} />}
          {type === 'ftb' && <FtbEditor stemText={questionBody} readOnly={isReadOnly} />}
          {type === 'sa'  && <SaEditor readOnly={isReadOnly} />}
          {type === 'mtf' && <MtfEditor readOnly={isReadOnly} />}
          {type === 'seq' && <SeqEditor readOnly={isReadOnly} />}
          {type === 'reo' && <ReoEditor readOnly={isReadOnly} />}

          {/* Config */}
          <ConfigBlock type={type} />

          {/* Hint */}
          {!isReadOnly && <HintBlock />}

          {/* Solution */}
          {!isReadOnly && <SolutionBlock />}

        </div>

        {/* Footer */}
        <div className="ce-ed-foot">
          <div className="grow" />
          <button type="button" className="ce-btn ghost" onClick={handleBack}>Cancel</button>
          {!isReadOnly && (
            <button
              type="button"
              className="ce-btn primary"
              onClick={handleSave}
              disabled={isSaving || !!invalidReason}
              title={invalidReason ?? undefined}
            >
              <Icon name="check" size={16} />
              {isSaving ? 'Saving…' : 'Save question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
