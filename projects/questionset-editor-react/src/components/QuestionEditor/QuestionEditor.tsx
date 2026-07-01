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
        <button type="button" onClick={() => setOpen(false)} title="Remove solution"
          style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--sb-text-faint)', display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 8 }}>
          <Icon name="x" size={18} />
        </button>
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {(['text', 'video', 'audio'] as const).map(k => {
          const active = kind === k;
          const label = k === 'text' ? 'Text + Image' : k.charAt(0).toUpperCase() + k.slice(1);
          const icon  = k === 'text' ? 'image' : k === 'video' ? 'video' : 'link';
          return (
            <button key={k} type="button" onClick={() => setKind(k)}
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
      {kind === 'text' && (
        <ContentEditable
          placeholder="Explain the answer — add text, images or equations…"
          minHeight={90}
          bodyClass="stem-field"
          disabled={false}
        />
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

      {/* Shared toolbar — sticky outside the card so overflow:hidden doesn't break it */}
      <div className="ce-ed-toolbar" style={{ position: 'sticky', top: 0, zIndex: 30 }}>
        <SharedRichToolbar disabled={isReadOnly} />
      </div>

      <div className="ce-ed-card">
        {/* Header — type badge */}
        <div className="ce-ed-head">
          <span className="badge">
            <Icon name={typeIcon} size={15} />
            {typeLabel}
          </span>
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
