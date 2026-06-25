import React, { Suspense, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useQuestionStore } from '../../../store/question.store';
import RichTextEditor from '../../RichTextEditor/RichTextEditor';
import styles from './MtfEditor.module.scss';

const MIN_PAIRS = 2;
const MAX_PAIRS = 5;

export default function MtfEditor() {
  const { matchPairs, addMatchPair, removeMatchPair, updateMatchPair } = useQuestionStore();
  const [isPartialScore, setIsPartialScore] = useState(false);

  return (
    <div className={styles.container}>
      {/* Column headers */}
      <div className={styles.columnsHeader}>
        <span className={styles.columnLabel}>Left (Question)</span>
        <span />
        <span className={styles.columnLabel}>Right (Answer)</span>
        <span />
      </div>

      <div className={styles.pairsList}>
        {matchPairs.map((pair, idx) => (
          <div key={pair.id} className={styles.pairRow}>
            {/* Left rich text */}
            <Suspense fallback={<div className={styles.rteFallback} />}>
              <RichTextEditor
                compact
                enableImages
                maxLength={160}
                value={pair.left}
                placeholder={`Left ${idx + 1}…`}
                onChange={(html) => updateMatchPair(pair.id, { left: html })}
              />
            </Suspense>

            {/* Visual connector */}
            <span className={styles.arrow} title="Match">↔</span>

            {/* Right rich text */}
            <Suspense fallback={<div className={styles.rteFallback} />}>
              <RichTextEditor
                compact
                enableImages
                maxLength={160}
                value={pair.right}
                placeholder={`Right ${idx + 1}…`}
                onChange={(html) => updateMatchPair(pair.id, { right: html })}
              />
            </Suspense>

            {/* Remove pair button — minimum 2 pairs enforced */}
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeMatchPair(pair.id)}
              disabled={matchPairs.length <= MIN_PAIRS}
              title="Remove pair"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Pair — maximum 5 pairs enforced */}
      <button
        type="button"
        className={styles.addBtn}
        onClick={addMatchPair}
        disabled={matchPairs.length >= MAX_PAIRS}
      >
        <Plus size={12} /> Add Pair
      </button>

      {matchPairs.length < MIN_PAIRS && (
        <p className={styles.hint}>Add at least {MIN_PAIRS} matching pairs.</p>
      )}

      {/* Partial scoring toggle */}
      <div className={styles.partialScoreRow}>
        <input
          id="mtf-partial-score"
          type="checkbox"
          className={styles.checkbox}
          checked={isPartialScore}
          onChange={(e) => setIsPartialScore(e.target.checked)}
        />
        <label htmlFor="mtf-partial-score">
          Partial Scoring — each correct pair earns 1 point independently
        </label>
      </div>
    </div>
  );
}
