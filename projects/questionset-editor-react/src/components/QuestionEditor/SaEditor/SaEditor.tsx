import React, { useState } from 'react';
import { useQuestionStore } from '../../../store/question.store';
import styles from './SaEditor.module.scss';

export default function SaEditor() {
  const { solutionText, setSolutionText } = useQuestionStore();
  const [wordLimit, setWordLimit] = useState<number>(200);
  const [evaluatorNotes, setEvaluatorNotes] = useState<string>('');

  return (
    <div className={styles.container}>
      <p className={styles.infoNote}>
        Subjective questions are evaluated manually or via an AI evaluator. Provide a model
        answer and notes to guide evaluation.
      </p>

      {/* Expected answer — stored in solutionText */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="sa-expected-answer">
          Expected Answer
        </label>
        <textarea
          id="sa-expected-answer"
          className={styles.textarea}
          value={solutionText}
          onChange={(e) => setSolutionText(e.target.value)}
          placeholder="Enter the model / expected answer here…"
          rows={5}
        />
      </div>

      {/* Word limit */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="sa-word-limit">
          Word Limit
        </label>
        <input
          id="sa-word-limit"
          type="number"
          className={styles.numberInput}
          min={0}
          step={10}
          value={wordLimit}
          onChange={(e) => setWordLimit(Math.max(0, Number(e.target.value)))}
          placeholder="e.g. 200"
        />
      </div>

      {/* Evaluator notes */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="sa-evaluator-notes">
          Evaluator Notes
        </label>
        <textarea
          id="sa-evaluator-notes"
          className={styles.textarea}
          value={evaluatorNotes}
          onChange={(e) => setEvaluatorNotes(e.target.value)}
          placeholder="Notes for the evaluator — key concepts to look for, scoring criteria…"
          rows={3}
        />
      </div>
    </div>
  );
}
