import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Save,
  CircleDot,
  CheckSquare,
  AlignLeft,
  List,
  ArrowUpDown,
  Shuffle,
} from 'lucide-react';

import { useQuestionStore } from '../../store/question.store';
import { useSaveQuestion } from '../../hooks/useSaveQuestion';
import type { EditorMode } from '../../types/editor';
import { QUESTION_TYPE_LABELS, type QuestionType } from '../../types/question';

import McqEditor from './McqEditor/McqEditor';
import MsqEditor from './MsqEditor/MsqEditor';
import SaEditor from './SaEditor/SaEditor';
import FtbEditor from './FtbEditor/FtbEditor';
import MtfEditor from './MtfEditor/MtfEditor';
import SeqEditor from './SeqEditor/SeqEditor';
import ReoEditor from './ReoEditor/ReoEditor';

import styles from './QuestionEditor.module.scss';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuestionEditorProps {
  editorMode: EditorMode;
}

// ---------------------------------------------------------------------------
// RichTextArea — basic textarea with a formatting toolbar
// (CKEditor integration point — see comment below)
// ---------------------------------------------------------------------------

interface RichTextAreaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  standalone?: boolean; // omit top toolbar border-radius adjustment
}

function RichTextArea({
  value,
  onChange,
  placeholder = 'Enter text…',
  minHeight = 100,
  disabled = false,
  standalone = false,
}: RichTextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after: string) {
    const el = ref.current;
    if (!el || disabled) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end);
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    // restore selection after react re-render
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, end + before.length);
    });
  }

  return (
    /*
     * Rich text editing — CKEditor integration point
     * Replace this entire block with <CKEditor editor={ClassicEditor} data={value}
     * onChange={(_, editor) => onChange(editor.getData())} /> when CKEditor is
     * available. The toolbar buttons below are a lightweight plain-text fallback.
     */
    <div>
      <div className={styles.richTextToolbar}>
        <button
          type="button"
          className={styles.richTextToolbarBtn}
          title="Bold"
          onClick={() => wrap('<b>', '</b>')}
          disabled={disabled}
        >
          <Bold size={12} />
        </button>
        <button
          type="button"
          className={styles.richTextToolbarBtn}
          title="Italic"
          onClick={() => wrap('<i>', '</i>')}
          disabled={disabled}
        >
          <Italic size={12} />
        </button>
        <button
          type="button"
          className={styles.richTextToolbarBtn}
          title="Underline"
          onClick={() => wrap('<u>', '</u>')}
          disabled={disabled}
        >
          <Underline size={12} />
        </button>
      </div>
      <textarea
        ref={ref}
        className={[
          styles.richTextArea,
          standalone ? styles.richTextAreaStandalone : '',
        ]
          .filter(Boolean)
          .join(' ')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight }}
        disabled={disabled}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuestionTypeSelector
// ---------------------------------------------------------------------------

const TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
  mcq: <CircleDot size={14} />,
  msq: <CheckSquare size={14} />,
  sa: <AlignLeft size={14} />,
  ftb: <Underline size={14} />,
  mtf: <Shuffle size={14} />,
  seq: <List size={14} />,
  reo: <ArrowUpDown size={14} />,
};

const ALL_TYPES: QuestionType[] = ['mcq', 'msq', 'sa', 'ftb', 'mtf', 'seq', 'reo'];

interface QuestionTypeSelectorProps {
  current: QuestionType | null;
  onSelect: (t: QuestionType) => void;
  disabled?: boolean;
}

function QuestionTypeSelector({ current, onSelect, disabled }: QuestionTypeSelectorProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className={styles.typeBadgeRow}>
      <span className={styles.typeBadge}>
        {current ? TYPE_ICONS[current] : null}
        {current ? QUESTION_TYPE_LABELS[current] : 'No type selected'}
      </span>

      {!disabled && (
        <div className={styles.typeDropdownWrapper} ref={wrapperRef}>
          <button
            type="button"
            className={styles.changeTypeBtn}
            onClick={() => setOpen((o) => !o)}
          >
            Change type <ChevronDown size={12} />
          </button>

          {open && (
            <div className={styles.typeDropdown}>
              {ALL_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={[styles.typeDropdownItem, t === current ? styles.active : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    onSelect(t);
                    setOpen(false);
                  }}
                >
                  {TYPE_ICONS[t]}
                  {QUESTION_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle Switch
// ---------------------------------------------------------------------------

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, id, disabled }: ToggleSwitchProps) {
  return (
    <label className={styles.toggleSwitch} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className={styles.slider} />
    </label>
  );
}

// ---------------------------------------------------------------------------
// Type-specific sub-editor
// ---------------------------------------------------------------------------

function TypeSpecificEditor({ questionType }: { questionType: QuestionType | null }) {
  switch (questionType) {
    case 'mcq': return <McqEditor />;
    case 'msq': return <MsqEditor />;
    case 'sa':  return <SaEditor />;
    case 'ftb': return <FtbEditor />;
    case 'mtf': return <MtfEditor />;
    case 'seq': return <SeqEditor />;
    case 'reo': return <ReoEditor />;
    default:    return null;
  }
}

// ---------------------------------------------------------------------------
// Main QuestionEditor
// ---------------------------------------------------------------------------

export default function QuestionEditor({ editorMode }: QuestionEditorProps) {
  const {
    questionType,
    questionBody,
    setQuestionBody,
    setQuestionType,
    hints,
    addHint,
    removeHint,
    updateHint,
    solutionText,
    setSolutionText,
    activeQuestion,
    isSaving,
  } = useQuestionStore();

  const { save } = useSaveQuestion();

  // Local metadata state (not stored in question store yet — extend as needed)
  const [difficultyLevel, setDifficultyLevel] = useState<string>(
    activeQuestion?.difficultyLevel ?? 'easy',
  );
  const [bloomsLevel, setBloomsLevel] = useState<string>(
    activeQuestion?.bloomsLevel ?? 'remember',
  );
  const [purpose, setPurpose] = useState<string>(activeQuestion?.purpose ?? 'practice');
  const [maxScore, setMaxScore] = useState<number>(activeQuestion?.maxScore ?? 1);
  const [expectedDuration, setExpectedDuration] = useState<number>(
    activeQuestion?.expectedDuration ?? 60,
  );
  const [showHintsMeta, setShowHintsMeta] = useState<boolean>(
    activeQuestion?.showHints ?? true,
  );
  const [showSolutionsMeta, setShowSolutionsMeta] = useState<boolean>(
    activeQuestion?.showSolutions ?? true,
  );

  const [hintsOpen, setHintsOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);

  const isReadOnly = editorMode === 'read' || editorMode === 'sourcingreview';

  return (
    <div className={styles.editor}>
      {/* ------------------------------------------------------------------ */}
      {/* Left panel                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className={styles.leftPanel}>
        {isReadOnly && (
          <div className={styles.readonlyBanner}>
            This question is in read-only mode ({editorMode}).
          </div>
        )}

        {/* Question body */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Question Body</p>
          <RichTextArea
            value={questionBody}
            onChange={setQuestionBody}
            placeholder="Enter the question text here…"
            minHeight={120}
            disabled={isReadOnly}
          />
        </div>

        {/* Question type */}
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Question Type</p>
          <QuestionTypeSelector
            current={questionType}
            onSelect={setQuestionType}
            disabled={isReadOnly}
          />
        </div>

        {/* Type-specific options panel */}
        {questionType && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Answer Options</p>
            <TypeSpecificEditor questionType={questionType} />
          </div>
        )}

        {/* Hints accordion */}
        <div className={styles.hintsSection}>
          <div className={styles.hintsAccordionHeader}>
            <button
              type="button"
              className={styles.hintsToggle}
              onClick={() => setHintsOpen((o) => !o)}
            >
              {hintsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Hints {hints.length > 0 && `(${hints.length})`}
            </button>
            {!isReadOnly && (
              <button
                type="button"
                className={styles.addHintBtn}
                onClick={() => {
                  addHint();
                  setHintsOpen(true);
                }}
              >
                <Plus size={12} /> Add Hint
              </button>
            )}
          </div>

          {hintsOpen && (
            <div className={styles.section}>
              {hints.length === 0 && (
                <span style={{ fontSize: 'var(--sbx-text-xs)', color: 'var(--sbx-color-text-tertiary)' }}>
                  No hints added yet.
                </span>
              )}
              {hints.map((hint, idx) => (
                <div key={hint.id} className={styles.hintRow}>
                  <RichTextArea
                    value={hint.body}
                    onChange={(v) => updateHint(hint.id, v)}
                    placeholder={`Hint ${idx + 1}…`}
                    minHeight={60}
                    disabled={isReadOnly}
                  />
                  {!isReadOnly && (
                    <button
                      type="button"
                      className={styles.removeHintBtn}
                      onClick={() => removeHint(hint.id)}
                      title="Remove hint"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Solution section */}
        <div className={styles.section}>
          <div className={styles.solutionToggleRow}>
            <p className={styles.sectionLabel} style={{ margin: 0 }}>Solution</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--sbx-text-xs)', color: 'var(--sbx-color-text-secondary)' }}>
              <ToggleSwitch
                id="solution-toggle"
                checked={solutionOpen}
                onChange={setSolutionOpen}
                disabled={isReadOnly}
              />
              Show explanation
            </label>
          </div>

          {solutionOpen && (
            <RichTextArea
              value={solutionText}
              onChange={setSolutionText}
              placeholder="Enter the solution or explanation for this question…"
              minHeight={80}
              disabled={isReadOnly}
            />
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Right panel — metadata                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className={styles.rightPanel}>
        <div className={styles.metaCard}>
          <p className={styles.metaCardTitle}>Question Metadata</p>

          <div className={styles.metaField}>
            <label htmlFor="meta-difficulty">Difficulty Level</label>
            <select
              id="meta-difficulty"
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(e.target.value)}
              disabled={isReadOnly}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className={styles.metaField}>
            <label htmlFor="meta-blooms">Bloom's Level</label>
            <select
              id="meta-blooms"
              value={bloomsLevel}
              onChange={(e) => setBloomsLevel(e.target.value)}
              disabled={isReadOnly}
            >
              <option value="remember">Remember</option>
              <option value="understand">Understand</option>
              <option value="apply">Apply</option>
              <option value="analyze">Analyze</option>
              <option value="evaluate">Evaluate</option>
              <option value="create">Create</option>
            </select>
          </div>

          <div className={styles.metaField}>
            <label htmlFor="meta-purpose">Purpose</label>
            <select
              id="meta-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              disabled={isReadOnly}
            >
              <option value="learn">Learn</option>
              <option value="practice">Practice</option>
              <option value="assess">Assess</option>
            </select>
          </div>

          <div className={styles.metaField}>
            <label htmlFor="meta-maxscore">Max Score</label>
            <input
              id="meta-maxscore"
              type="number"
              min={0}
              step={1}
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              disabled={isReadOnly}
            />
          </div>

          <div className={styles.metaField}>
            <label htmlFor="meta-duration">Expected Duration (s)</label>
            <input
              id="meta-duration"
              type="number"
              min={0}
              step={5}
              value={expectedDuration}
              onChange={(e) => setExpectedDuration(Number(e.target.value))}
              disabled={isReadOnly}
            />
          </div>

          <div className={styles.metaDivider} />

          <div className={styles.metaToggleField}>
            <label htmlFor="meta-showhints">Show Hints</label>
            <ToggleSwitch
              id="meta-showhints"
              checked={showHintsMeta}
              onChange={setShowHintsMeta}
              disabled={isReadOnly}
            />
          </div>

          <div className={styles.metaToggleField}>
            <label htmlFor="meta-showsolutions">Show Solutions</label>
            <ToggleSwitch
              id="meta-showsolutions"
              checked={showSolutionsMeta}
              onChange={setShowSolutionsMeta}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            className={styles.saveBtn}
            onClick={save}
            disabled={isSaving}
          >
            <Save size={14} />
            {isSaving ? 'Saving…' : 'Save Question'}
          </button>
        )}
      </div>
    </div>
  );
}
