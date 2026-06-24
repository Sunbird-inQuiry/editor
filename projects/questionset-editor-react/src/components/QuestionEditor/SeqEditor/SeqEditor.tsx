import React from 'react';
import { GripVertical, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useQuestionStore } from '../../../store/question.store';
import styles from './SeqEditor.module.scss';

export default function SeqEditor() {
  const { sequence, setSequence } = useQuestionStore();

  function addItem() {
    setSequence([...sequence, '']);
  }

  function removeItem(idx: number) {
    const next = sequence.filter((_, i) => i !== idx);
    setSequence(next);
  }

  function updateItem(idx: number, value: string) {
    const next = sequence.map((item, i) => (i === idx ? value : item));
    setSequence(next);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...sequence];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setSequence(next);
  }

  function moveDown(idx: number) {
    if (idx === sequence.length - 1) return;
    const next = [...sequence];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setSequence(next);
  }

  return (
    <div className={styles.container}>
      <p className={styles.header}>
        Arrange items in the correct sequence. The order shown here is the correct answer.
      </p>

      {sequence.length === 0 && (
        <p className={styles.emptyMsg}>No sequence items added yet.</p>
      )}

      <div className={styles.itemsList}>
        {sequence.map((item, idx) => (
          <div key={idx} className={styles.itemRow}>
            {/* Drag handle (visual only — manual reorder via buttons) */}
            <span className={styles.dragHandle}>
              <GripVertical size={16} />
            </span>

            {/* Position badge */}
            <span className={styles.orderIndex}>{idx + 1}</span>

            {/* Item text input */}
            <input
              type="text"
              className={styles.itemInput}
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder={`Step ${idx + 1}…`}
            />

            {/* Up / Down reorder */}
            <div className={styles.moveButtons}>
              <button
                type="button"
                className={styles.moveBtn}
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                title="Move up"
              >
                <ChevronUp size={10} />
              </button>
              <button
                type="button"
                className={styles.moveBtn}
                onClick={() => moveDown(idx)}
                disabled={idx === sequence.length - 1}
                title="Move down"
              >
                <ChevronDown size={10} />
              </button>
            </div>

            {/* Remove */}
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeItem(idx)}
              disabled={sequence.length <= 1}
              title="Remove item"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button type="button" className={styles.addBtn} onClick={addItem}>
        <Plus size={12} /> Add Item
      </button>
    </div>
  );
}
