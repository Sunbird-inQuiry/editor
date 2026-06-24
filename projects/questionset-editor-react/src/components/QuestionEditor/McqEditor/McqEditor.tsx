import React, { useRef } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useQuestionStore } from '../../../store/question.store';
import styles from './McqEditor.module.scss';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const MAX_OPTIONS = 6;

export default function McqEditor() {
  const { options, updateOption, addOption, removeOption } = useQuestionStore();

  function handleSelectCorrect(id: string) {
    // Deselect all then select the clicked one (single correct)
    options.forEach((o) => {
      updateOption(o.id, { isCorrect: o.id === id });
    });
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
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

          {/* Option text + correct label */}
          <div className={styles.optionBody}>
            <textarea
              className={styles.optionTextarea}
              value={option.body}
              placeholder={`Option ${OPTION_LETTERS[idx] ?? idx + 1}…`}
              rows={1}
              onChange={(e) => {
                updateOption(option.id, { body: e.target.value });
                autoResize(e.target);
              }}
              onFocus={(e) => autoResize(e.target)}
            />
            {option.isCorrect && (
              <span className={styles.correctLabel}>
                <Check size={12} /> Correct answer
              </span>
            )}
          </div>

          {/* Remove button (keep at least 2 options) */}
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => removeOption(option.id)}
            disabled={options.length <= 2}
            title="Remove option"
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
