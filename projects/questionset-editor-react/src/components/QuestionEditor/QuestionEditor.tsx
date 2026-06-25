import React, { lazy, Suspense, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Save,
  CircleDot,
  CheckSquare,
  AlignLeft,
  Underline,
  List,
  ArrowUpDown,
  Shuffle,
  SlidersHorizontal,
  Minus,
  Clock,
  Brain,
  Target,
  Star,
  Eye,
  FileText,
  Settings2,
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

const RichTextEditor = lazy(() => import('../RichTextEditor/RichTextEditor'));
const SliderEditor   = lazy(() => import('./SliderEditor/SliderEditor'));

import styles from './QuestionEditor.module.scss';

export interface QuestionEditorProps {
  editorMode: EditorMode;
}

type EditorTab = 'question' | 'properties';

// ---------------------------------------------------------------------------
// Question type selector
// ---------------------------------------------------------------------------

const TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
  mcq:    <CircleDot size={14} />,
  msq:    <CheckSquare size={14} />,
  sa:     <AlignLeft size={14} />,
  ftb:    <Underline size={14} />,
  mtf:    <Shuffle size={14} />,
  seq:    <List size={14} />,
  reo:    <ArrowUpDown size={14} />,
  slider: <SlidersHorizontal size={14} />,
};

const ALL_TYPES: QuestionType[] = ['mcq', 'msq', 'sa', 'ftb', 'mtf', 'seq', 'reo', 'slider'];

function QuestionTypeSelector({
  current, onSelect, disabled,
}: { current: QuestionType | null; onSelect: (t: QuestionType) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className={styles.typeBadgeRow}>
      <span className={styles.typeBadge}>
        {current && TYPE_ICONS[current]}
        {current ? QUESTION_TYPE_LABELS[current] : 'No type selected'}
      </span>
      {!disabled && (
        <div className={styles.typeDropdownWrapper} ref={ref}>
          <button type="button" className={styles.changeTypeBtn} onClick={() => setOpen(o => !o)}>
            Change type <ChevronDown size={12} />
          </button>
          {open && (
            <div className={styles.typeDropdown}>
              {ALL_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  className={[styles.typeDropdownItem, t === current ? styles.active : ''].filter(Boolean).join(' ')}
                  onClick={() => { onSelect(t); setOpen(false); }}
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
// Toggle switch
// ---------------------------------------------------------------------------

function ToggleSwitch({ checked, onChange, id, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; id: string; disabled?: boolean;
}) {
  return (
    <label className={styles.toggleSwitch} htmlFor={id}>
      <input id={id} type="checkbox" checked={checked}
        onChange={e => onChange(e.target.checked)} disabled={disabled} />
      <span className={styles.toggleSlider} />
    </label>
  );
}

// ---------------------------------------------------------------------------
// Pill selector
// ---------------------------------------------------------------------------

interface PillOption { value: string; label: string; color?: string; }

function PillSelector({ options, value, onChange, disabled, columns = 3 }: {
  options: PillOption[]; value: string; onChange: (v: string) => void;
  disabled?: boolean; columns?: 2 | 3 | 6;
}) {
  return (
    <div className={styles.pillGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} role="group">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={[
            styles.pill,
            opt.color ? styles[`pill--${opt.color}`] : '',
            value === opt.value ? styles['pill--active'] : '',
          ].filter(Boolean).join(' ')}
          onClick={() => !disabled && onChange(opt.value)}
          disabled={disabled}
          aria-pressed={value === opt.value}
          title={opt.label}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Score stepper
// ---------------------------------------------------------------------------

function ScoreStepper({ value, onChange, min = 0, max = 100, step = 1, disabled }: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; disabled?: boolean;
}) {
  return (
    <div className={styles.stepper}>
      <button type="button" className={styles.stepperBtn}
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={disabled || value <= min} aria-label="Decrease">
        <Minus size={12} />
      </button>
      <input type="number" className={styles.stepperInput} value={value} min={min} max={max}
        onChange={e => { const v = Number(e.target.value); if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
        disabled={disabled} aria-label="Max score" />
      <button type="button" className={styles.stepperBtn}
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={disabled || value >= max} aria-label="Increase">
        <Plus size={12} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Duration picker — MM : SS
// ---------------------------------------------------------------------------

function DurationPicker({ seconds, onChange, disabled }: {
  seconds: number; onChange: (v: number) => void; disabled?: boolean;
}) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <div className={styles.durationPicker}>
      <input type="number" className={styles.durationPart}
        value={String(mins).padStart(2, '0')} min={0} max={99}
        onChange={e => onChange(Math.max(0, Math.min(99, Number(e.target.value) || 0)) * 60 + secs)}
        disabled={disabled} aria-label="Minutes" />
      <span className={styles.durationColon}>:</span>
      <input type="number" className={styles.durationPart}
        value={String(secs).padStart(2, '0')} min={0} max={59}
        onChange={e => onChange(mins * 60 + Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
        disabled={disabled} aria-label="Seconds" />
      <span className={styles.durationUnit}>mm:ss</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section heading
// ---------------------------------------------------------------------------

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className={styles.metaSectionHeading}>
      <span className={styles.metaSectionIcon}>{icon}</span>
      <span className={styles.metaSectionLabel}>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static option lists
// ---------------------------------------------------------------------------

const DIFFICULTY_OPTIONS: PillOption[] = [
  { value: 'easy',   label: 'Easy',   color: 'easy' },
  { value: 'medium', label: 'Medium', color: 'medium' },
  { value: 'hard',   label: 'Hard',   color: 'hard' },
];
const PURPOSE_OPTIONS: PillOption[] = [
  { value: 'learn',    label: 'Learn',    color: 'learn' },
  { value: 'practice', label: 'Practice', color: 'practice' },
  { value: 'assess',   label: 'Assess',   color: 'assess' },
];
const BLOOMS_OPTIONS: PillOption[] = [
  { value: 'remember',   label: 'Remember',   color: 'b1' },
  { value: 'understand', label: 'Understand', color: 'b2' },
  { value: 'apply',      label: 'Apply',      color: 'b3' },
  { value: 'analyze',    label: 'Analyze',    color: 'b4' },
  { value: 'evaluate',   label: 'Evaluate',   color: 'b5' },
  { value: 'create',     label: 'Create',     color: 'b6' },
];

// ---------------------------------------------------------------------------
// Type-specific editor
// ---------------------------------------------------------------------------

function TypeSpecificEditor({ questionType }: { questionType: QuestionType | null }) {
  switch (questionType) {
    case 'mcq':    return <McqEditor />;
    case 'msq':    return <MsqEditor />;
    case 'sa':     return <SaEditor />;
    case 'ftb':    return <FtbEditor />;
    case 'mtf':    return <MtfEditor />;
    case 'seq':    return <SeqEditor />;
    case 'reo':    return <ReoEditor />;
    case 'slider': return (
      <Suspense fallback={<div className={styles.suspenseFallback}>Loading…</div>}>
        <SliderEditor />
      </Suspense>
    );
    default: return null;
  }
}

function RTESpinner({ height = 120 }: { height?: number }) {
  return <div className={styles.suspenseFallback} style={{ minHeight: height }}>Loading editor…</div>;
}

// ---------------------------------------------------------------------------
// Main QuestionEditor
// ---------------------------------------------------------------------------

export default function QuestionEditor({ editorMode }: QuestionEditorProps) {
  const {
    questionType, setQuestionType,
    questionBody, setQuestionBody,
    hints, addHint, removeHint, updateHint,
    solutionText, setSolutionText,
    isSaving,
    difficultyLevel,  setDifficultyLevel,
    bloomsLevel,      setBloomsLevel,
    purpose,          setPurpose,
    maxScore,         setMaxScore,
    expectedDuration, setExpectedDuration,
    showHints,        setShowHints,
    showSolutions,    setShowSolutions,
  } = useQuestionStore();

  const { save } = useSaveQuestion();

  const [activeTab, setActiveTab]       = useState<EditorTab>('question');
  const [hintsOpen, setHintsOpen]       = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);

  const isReadOnly = editorMode === 'read' || editorMode === 'sourcingreview';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={styles.editor}>

      {/* ── Sticky tab header ──────────────────────────────────────────────── */}
      <div className={styles.editorHeader}>
        <div className={styles.tabBar} role="tablist">
          <button
            role="tab"
            type="button"
            className={[styles.tab, activeTab === 'question' ? styles.tabActive : ''].filter(Boolean).join(' ')}
            aria-selected={activeTab === 'question'}
            onClick={() => setActiveTab('question')}
          >
            <FileText size={13} />
            Question
          </button>
          <button
            role="tab"
            type="button"
            className={[styles.tab, activeTab === 'properties' ? styles.tabActive : ''].filter(Boolean).join(' ')}
            aria-selected={activeTab === 'properties'}
            onClick={() => setActiveTab('properties')}
          >
            <Settings2 size={13} />
            Properties
          </button>
        </div>

        {!isReadOnly && (
          <button type="button" className={styles.saveBtn} onClick={save} disabled={isSaving}>
            <Save size={14} />
            {isSaving ? 'Saving…' : 'Save Question'}
          </button>
        )}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div className={styles.tabContent}>

        {/* ══ Question tab ═══════════════════════════════════════════════════ */}
        {activeTab === 'question' && (
          <div className={styles.questionTab} role="tabpanel" aria-label="Question">
            {isReadOnly && (
              <div className={styles.readonlyBanner}>
                This question is in read-only mode ({editorMode}).
              </div>
            )}

            {/* Question Body */}
            <div className={styles.qSection}>
              <p className={styles.sectionLabel}>Question Body</p>
              <Suspense fallback={<RTESpinner height={120} />}>
                <RichTextEditor
                  value={questionBody}
                  onChange={setQuestionBody}
                  placeholder="Enter the question text here…"
                  minHeight={140}
                  disabled={isReadOnly}
                  enableImages={true}
                />
              </Suspense>
            </div>

            {/* Question Type */}
            <div className={styles.qSection}>
              <p className={styles.sectionLabel}>Question Type</p>
              <QuestionTypeSelector
                current={questionType}
                onSelect={setQuestionType}
                disabled={isReadOnly}
              />
            </div>

            {/* Answer Options */}
            {questionType && (
              <div className={styles.qSection}>
                <p className={styles.sectionLabel}>Answer Options</p>
                <TypeSpecificEditor questionType={questionType} />
              </div>
            )}

            {/* Hints */}
            <div className={styles.hintsSection}>
              <div className={styles.hintsAccordionHeader}>
                <button type="button" className={styles.hintsToggle} onClick={() => setHintsOpen(o => !o)}>
                  {hintsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  Hints {hints.length > 0 && `(${hints.length})`}
                </button>
                {!isReadOnly && (
                  <button type="button" className={styles.addHintBtn}
                    onClick={() => { addHint(); setHintsOpen(true); }}>
                    <Plus size={12} /> Add Hint
                  </button>
                )}
              </div>
              {hintsOpen && (
                <div className={styles.qSection}>
                  {hints.length === 0 && <span className={styles.emptyNote}>No hints added yet.</span>}
                  {hints.map((hint, idx) => (
                    <div key={hint.id} className={styles.hintRow}>
                      <Suspense fallback={<RTESpinner height={60} />}>
                        <RichTextEditor
                          value={hint.body}
                          onChange={v => updateHint(hint.id, v)}
                          placeholder={`Hint ${idx + 1}…`}
                          minHeight={60}
                          disabled={isReadOnly}
                        />
                      </Suspense>
                      {!isReadOnly && (
                        <button type="button" className={styles.removeHintBtn}
                          onClick={() => removeHint(hint.id)} title="Remove hint">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Solution */}
            <div className={styles.qSection}>
              <div className={styles.solutionToggleRow}>
                <p className={styles.sectionLabel} style={{ margin: 0 }}>Solution</p>
                <label className={styles.solutionToggleLabel}>
                  <ToggleSwitch id="solution-toggle" checked={solutionOpen}
                    onChange={setSolutionOpen} disabled={isReadOnly} />
                  Show explanation
                </label>
              </div>
              {solutionOpen && (
                <Suspense fallback={<RTESpinner height={80} />}>
                  <RichTextEditor
                    value={solutionText}
                    onChange={setSolutionText}
                    placeholder="Enter the solution or explanation for this question…"
                    minHeight={80}
                    disabled={isReadOnly}
                  />
                </Suspense>
              )}
            </div>

          </div>
        )}

        {/* ══ Properties tab ═════════════════════════════════════════════════ */}
        {activeTab === 'properties' && (
          <div className={styles.propertiesTab} role="tabpanel" aria-label="Properties">

            {/* Two-column grid for wider screens */}
            <div className={styles.propsGrid}>

              {/* Performance */}
              <div className={styles.propCard}>
                <SectionHeading icon={<Target size={14} />} label="Performance" />
                <div className={styles.metaField}>
                  <label className={styles.metaLabel}>Difficulty</label>
                  <PillSelector options={DIFFICULTY_OPTIONS} value={difficultyLevel}
                    onChange={setDifficultyLevel} disabled={isReadOnly} />
                </div>
                <div className={styles.metaField}>
                  <label className={styles.metaLabel}>Purpose</label>
                  <PillSelector options={PURPOSE_OPTIONS} value={purpose}
                    onChange={setPurpose} disabled={isReadOnly} />
                </div>
              </div>

              {/* Scoring & Time */}
              <div className={styles.propCard}>
                <SectionHeading icon={<Star size={14} />} label="Scoring & Time" />
                <div className={styles.metaField}>
                  <label className={styles.metaLabel}>Max Score</label>
                  <ScoreStepper value={maxScore} onChange={setMaxScore} min={0} max={100} disabled={isReadOnly} />
                </div>
                <div className={styles.metaField}>
                  <label className={styles.metaLabel}>
                    <Clock size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                    Expected Duration
                  </label>
                  <DurationPicker seconds={expectedDuration} onChange={setExpectedDuration} disabled={isReadOnly} />
                </div>
              </div>

              {/* Bloom's Taxonomy — spans full width */}
              <div className={[styles.propCard, styles.propCardFull].join(' ')}>
                <SectionHeading icon={<Brain size={14} />} label="Bloom's Taxonomy" />
                <PillSelector options={BLOOMS_OPTIONS} value={bloomsLevel}
                  onChange={setBloomsLevel} disabled={isReadOnly} columns={6} />
              </div>

              {/* Visibility */}
              <div className={[styles.propCard, styles.propCardFull].join(' ')}>
                <SectionHeading icon={<Eye size={14} />} label="Visibility" />
                <div className={styles.visibilityRow}>
                  <div className={styles.metaToggleField}>
                    <div className={styles.metaToggleInfo}>
                      <span className={styles.metaLabel}>Hints</span>
                      <span className={styles.metaToggleHint}>Show hint button to learners</span>
                    </div>
                    <ToggleSwitch id="meta-showhints" checked={showHints}
                      onChange={setShowHints} disabled={isReadOnly} />
                  </div>
                  <div className={styles.metaToggleField}>
                    <div className={styles.metaToggleInfo}>
                      <span className={styles.metaLabel}>Solution</span>
                      <span className={styles.metaToggleHint}>Show solution after attempt</span>
                    </div>
                    <ToggleSwitch id="meta-showsolutions" checked={showSolutions}
                      onChange={setShowSolutions} disabled={isReadOnly} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
