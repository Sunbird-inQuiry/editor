import React, { Suspense, useState } from 'react';
import { Plus, X, Check, Lightbulb } from 'lucide-react';
import { useQuestionStore } from '../../../store/question.store';
import RichTextEditor from '../../RichTextEditor/RichTextEditor';
import styles from './McqEditor.module.scss';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const MAX_OPTIONS = 6;

export default function McqEditor() {
  const { options, updateOption, addOption, removeOption } = useQuestionStore();

  // Track which option IDs have their hint textarea open
  const [openHints, setOpenHints] = useState<Set<string>>(new Set());

  function handleSelectCorrect(id: string) {
    // Deselect all then select the clicked one (single correct)
    options.forEach((o) => {
      updateOption(o.id, { isCorrect: o.id === id });
    });
  }

  function toggleHint(id: string) {
    setOpenHints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className={styles.container}>
      {options.map((option, idx) => (
        <div
          key={option.id}
          className={[styles.optionRow, option.isCorrect ? styles.correct : '']
            .filter(Boolean)
            .join(' ')}
        >
          {/* Letter badge */}
          <span className={styles.optionLetter}>{OPTION_LETTERS[idx] ?? idx + 1}</span>

          {/* Radio — selecting marks as the single correct answer */}
          <div className={styles.radioWrapper}>
            <input
              type="radio"
              className={styles.radio}
              name="mcq-correct"
              checked={!!option.isCorrect}
              onChange={() => handleSelectCorrect(option.id)}
              aria-label={`Mark option ${OPTION_LETTERS[idx] ?? idx + 1} as correct`}
            />
          </div>

          {/* Option rich text + correct label + hint textarea */}
          <div className={styles.optionBody}>
            <Suspense fallback={<div className={styles.rteFallback} />}>
              <RichTextEditor
                compact
                enableImages
                maxLength={160}
                value={option.body}
                placeholder={`Option ${OPTION_LETTERS[idx] ?? idx + 1}…`}
                onChange={(html) => updateOption(option.id, { body: html })}
              />
            </Suspense>
            {option.isCorrect && (
              <span className={styles.correctLabel}>
                <Check size={12} /> Correct answer
              </span>
            )}
            {openHints.has(option.id) && (
              <textarea
                className={styles.hintTextarea}
                value={option.hint ?? ''}
                placeholder="Enter a hint for this option…"
                rows={2}
                onChange={(e) => updateOption(option.id, { hint: e.target.value })}
                aria-label={`Hint for option ${OPTION_LETTERS[idx] ?? idx + 1}`}
              />
            )}
          </div>

          {/* Hint toggle button */}
          <button
            type="button"
            className={[styles.removeBtn, openHints.has(option.id) ? styles.hintBtnActive : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => toggleHint(option.id)}
            title={openHints.has(option.id) ? 'Hide hint' : 'Add hint'}
            aria-pressed={openHints.has(option.id)}
            style={{ marginTop: 6 }}
          >
            <Lightbulb size={14} />
          </button>

          {/* Remove button (keep at least 2 options) */}
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => removeOption(option.id)}
            disabled={options.length <= 2}
            title="Remove option"
            style={{ marginTop: 6 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <button
        type="button"
        className={styles.addBtn}
        onClick={addOption}
        disabled={options.length >= MAX_OPTIONS}
      >
        <Plus size={12} /> Add Option
      </button>

      {options.filter((o) => o.isCorrect).length === 0 && (
        <p className={styles.hint}>Select a radio button to mark the correct answer.</p>
      )}
    </div>
  );
}
