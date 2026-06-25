import React, { useState, useMemo } from 'react';
import { useQuestionStore } from '../../../store/question.store';
import styles from './FtbEditor.module.scss';

const BLANK_PATTERN = /\{\{blank\}\}/g;

export default function FtbEditor() {
  const { questionBody } = useQuestionStore();

  // Count blanks from the question body
  const blankCount = useMemo(() => {
    const matches = questionBody.match(BLANK_PATTERN);
    return matches ? matches.length : 0;
  }, [questionBody]);

  // Answers keyed by blank index
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [isPartialScore, setIsPartialScore] = useState(false);
  const [evalUnordered, setEvalUnordered] = useState(false);

  function setAnswer(idx: number, value: string) {
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  }

  return (
    <div className={styles.container}>
      <div className={styles.instructionBanner}>
        Use <code>{'{{blank}}'}</code> in the question body above to mark blank positions.
        Each <code>{'{{blank}}'}</code> will appear as a text field for the learner to fill in.
      </div>

      {blankCount === 0 ? (
        <p className={styles.noBlankMsg}>
          No blanks detected yet. Add <code>{'{{blank}}'}</code> to the question body.
        </p>
      ) : (
        <>
          <p className={styles.blankCount}>
            {blankCount} blank{blankCount > 1 ? 's' : ''} detected
          </p>

          <div className={styles.blanksList}>
            {Array.from({ length: blankCount }, (_, i) => (
              <div key={i} className={styles.blankRow}>
                <span className={styles.blankIndex}>{i + 1}</span>
                <span className={styles.blankLabel}>Blank {i + 1}:</span>
                <input
                  type="text"
                  className={styles.blankInput}
                  value={answers[i] ?? ''}
                  onChange={(e) => setAnswer(i, e.target.value)}
                  placeholder={`Expected answer for blank ${i + 1}…`}
                />
              </div>
            ))}
          </div>

          <div className={styles.caseSensitiveRow}>
            <input
              id="ftb-case-sensitive"
              type="checkbox"
              className={styles.checkbox}
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            <label htmlFor="ftb-case-sensitive">Case sensitive matching</label>
          </div>

          <div className={styles.caseSensitiveRow}>
            <input
              id="ftb-partial-score"
              type="checkbox"
              className={styles.checkbox}
              checked={isPartialScore}
              onChange={(e) => setIsPartialScore(e.target.checked)}
            />
            <label htmlFor="ftb-partial-score">Partial Scoring</label>
          </div>

          <div className={styles.caseSensitiveRow}>
            <input
              id="ftb-eval-unordered"
              type="checkbox"
              className={styles.checkbox}
              checked={evalUnordered}
              onChange={(e) => setEvalUnordered(e.target.checked)}
            />
            <label htmlFor="ftb-eval-unordered">Order doesn&apos;t matter (evalUnordered)</label>
          </div>
        </>
      )}
    </div>
  );
}
