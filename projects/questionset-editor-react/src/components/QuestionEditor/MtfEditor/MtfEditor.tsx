import React from 'react';
import { Plus, X } from 'lucide-react';
import { useQuestionStore } from '../../../store/question.store';
import styles from './MtfEditor.module.scss';

export default function MtfEditor() {
  const { matchPairs, addMatchPair, removeMatchPair, updateMatchPair } = useQuestionStore();

  return (
    <div className={styles.container}>
      {/* Column headers */}
      <div className={styles.columnsHeader}>
        <span className={styles.columnLabel}>Left (Question)</span>
        {/* spacer for arrow */}
        <span />
        <span className={styles.columnLabel}>Right (Answer)</span>
        {/* spacer for remove button */}
        <span />
      </div>

      <div className={styles.pairsList}>
        {matchPairs.map((pair, idx) => (
          <div key={pair.id} className={styles.pairRow}>
            {/* Left input */}
            <input
              type="text"
              className={styles.pairInput}
              value={pair.left}
              onChange={(e) => updateMatchPair(pair.id, { left: e.target.value })}
              placeholder={`Left ${idx + 1}…`}
            />

            {/* Visual connector */}
            <span className={styles.arrow} title="Match">↔</span>

            {/* Right input */}
            <input
              type="text"
              className={styles.pairInput}
              value={pair.right}
              onChange={(e) => updateMatchPair(pair.id, { right: e.target.value })}
              placeholder={`Right ${idx + 1}…`}
            />

            {/* Remove pair button */}
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeMatchPair(pair.id)}
              disabled={matchPairs.length <= 1}
              title="Remove pair"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button type="button" className={styles.addBtn} onClick={addMatchPair}>
        <Plus size={12} /> Add Pair
      </button>

      {matchPairs.length === 0 && (
        <p className={styles.hint}>Add at least one matching pair.</p>
      )}
    </div>
  );
}
