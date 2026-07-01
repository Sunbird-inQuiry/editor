import React, { useState } from 'react';
import { Icon } from '../shared/Icon';
import SharedRichToolbar from '../shared/SharedRichToolbar';
import ContentEditable from '../shared/ContentEditable';
import { useQuestionStore } from '../../store/question.store';
import { useSaveQuestion } from '../../hooks/useSaveQuestion';
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
  const [partial,   setPartial]   = useState(false);
  const [anyOrder,  setAnyOrder]  = useState(false);
  const hasPartial  = type === 'seq' || type === 'ftb' || type === 'mtf';
  const hasAnyOrder = type === 'ftb';
  if (!hasPartial && !hasAnyOrder) return null;

  return (
    <div className="ce-cfg">
      <div className="ce-cfg-ttl">Configuration</div>
      {hasPartial && (
        <label className="ce-cfg-row" onClick={() => setPartial(p => !p)}>
          <input type="checkbox" className="sb-check" checked={partial} readOnly />
          <span className="t">
            Partial scoring
            <em>Award marks for each correct response, not all-or-nothing</em>
          </span>
        </label>
      )}
      {hasAnyOrder && (
        <label className="ce-cfg-row" onClick={() => setAnyOrder(a => !a)}>
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
// SolutionBlock — optional solution with Text/Video/Audio
// ---------------------------------------------------------------------------

function SolutionBlock() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<'text' | 'video' | 'audio'>('text');

  if (!open) {
    return (
      <button type="button" className="ce-sol-add" onClick={() => setOpen(true)}>
        <span className="ic"><Icon name="plus" size={17} /></span>
        <span className="tx">
          <b>Add a solution</b>
          <em>Optional — explain the answer with text, video or audio</em>
        </span>
      </button>
    );
  }

  return (
    <div className="ce-sol2">
      <div className="ce-sol2-head">
        <span className="ttl"><Icon name="info" size={16} />Solution <em>Optional</em></span>
        <button type="button" className="ce-sol2-close" onClick={() => setOpen(false)} title="Remove solution">
          <Icon name="x" size={16} />
        </button>
      </div>
      <div className="ce-sol2-seg">
        {(['text', 'video', 'audio'] as const).map(k => (
          <button type="button" key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>
            <Icon name={k === 'text' ? 'image' : k === 'video' ? 'video' : 'link'} size={16} />
            {k === 'text' ? 'Text + Image' : k.charAt(0).toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>
      <div className="ce-sol2-body">
        {kind === 'text' && (
          <div className="ce-sol-drop" style={{ minHeight: 96, fontStyle: 'normal', gap: 0 }}>
            <textarea
              style={{ width: '100%', minHeight: 80, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', fontSize: 15, resize: 'none', padding: 8 }}
              placeholder="Explain the answer — add text, images or equations…"
            />
          </div>
        )}
        {kind === 'video' && (
          <div className="ce-sol-drop">
            <Icon name="video" size={26} />
            <span>Drop a video file or paste a link</span>
          </div>
        )}
        {kind === 'audio' && (
          <div className="ce-sol-drop">
            <Icon name="link" size={24} />
            <span>Drop an audio clip or paste a link</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main QuestionEditor
// ---------------------------------------------------------------------------


export default function QuestionEditor({ editorMode, onBack }: QuestionEditorProps) {
  const { questionType, questionBody, setQuestionBody, isSaving } = useQuestionStore();
  const { save } = useSaveQuestion();

  const isReadOnly = editorMode === 'read' || editorMode === 'sourcingreview';
  const type = questionType as QuestionType | null;
  const typeLabel = type ? (QUESTION_TYPE_LABELS[type] ?? type) : 'Question';
  const typeIcon  = type ? (TYPE_ICON[type] ?? 'help') : 'help';
  const stemHint  = type ? (STEM_HINT[type] ?? '') : '';

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

        {/* Shared toolbar — sticky, one toolbar for ALL contenteditable fields */}
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

          {/* Solution */}
          {!isReadOnly && <SolutionBlock />}

        </div>

        {/* Footer */}
        <div className="ce-ed-foot">
          <div className="grow" />
          <button type="button" className="ce-btn ghost" onClick={handleBack}>Cancel</button>
          {!isReadOnly && (
            <button type="button" className="ce-btn primary" onClick={handleSave} disabled={isSaving}>
              <Icon name="check" size={16} />
              {isSaving ? 'Saving…' : 'Save question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
