import React, { useCallback } from 'react';
import { useTreeStore } from '../../store/tree.store';
import styles from './SectionBehaviourForm.module.scss';

interface SectionBehaviourFormProps {
  nodeId: string;
  readOnly?: boolean;
}

const SectionBehaviourForm: React.FC<SectionBehaviourFormProps> = ({ nodeId, readOnly = false }) => {
  const activeNodeMeta = useTreeStore((s) => s.activeNodeMeta);
  const updateNode = useTreeStore((s) => s.updateNode);

  const meta = activeNodeMeta as Record<string, unknown>;
  const questionsToDisplay = (meta.questionsToDisplay as string) ?? '';
  const shuffle       = (meta.shuffle       as boolean) ?? true;
  const showFeedback  = (meta.showFeedback  as boolean) ?? false;
  const showSolutions = (meta.showSolutions as boolean) ?? false;
  const showHint      = (meta.showHint      as boolean) ?? false;

  const patch = useCallback((key: string, value: unknown) => {
    if (!nodeId) return;
    updateNode(nodeId, { [key]: value });
  }, [nodeId, updateNode]);

  return (
    <div className={styles.form}>
      <div className={styles.grid}>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label}>Questions to Display</label>
          <select className={styles.select} value={questionsToDisplay}
            disabled={readOnly} onChange={e => patch('questionsToDisplay', e.target.value)}>
            <option value="">All questions</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="All">All</option>
          </select>
        </div>

        <div className={styles.divider} />

        <div className={styles.checkGrid}>
          <label className={styles.checkRow}>
            <input type="checkbox" className={styles.checkbox} checked={shuffle}
              disabled={readOnly} onChange={e => patch('shuffle', e.target.checked)} />
            Shuffle questions
          </label>
          <label className={styles.checkRow}>
            <input type="checkbox" className={styles.checkbox} checked={showFeedback}
              disabled={readOnly} onChange={e => patch('showFeedback', e.target.checked)} />
            Show question feedback
          </label>
          <label className={styles.checkRow}>
            <input type="checkbox" className={styles.checkbox} checked={showSolutions}
              disabled={readOnly} onChange={e => patch('showSolutions', e.target.checked)} />
            Show solutions
          </label>
          <label className={styles.checkRow}>
            <input type="checkbox" className={styles.checkbox} checked={showHint}
              disabled={readOnly} onChange={e => patch('showHint', e.target.checked)} />
            Show hint
          </label>
        </div>

      </div>
    </div>
  );
};

export default SectionBehaviourForm;
