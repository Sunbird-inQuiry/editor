import React, { useCallback } from 'react';
import { useTreeStore } from '../../store/tree.store';
import styles from './SetBehaviourForm.module.scss';

interface SetBehaviourFormProps {
  nodeId: string;
  readOnly?: boolean;
}

const SetBehaviourForm: React.FC<SetBehaviourFormProps> = ({ nodeId, readOnly = false }) => {
  const activeNodeMeta = useTreeStore((s) => s.activeNodeMeta);
  const updateNode = useTreeStore((s) => s.updateNode);

  const meta = activeNodeMeta as Record<string, unknown>;
  const timeLimits = (meta.timeLimits as { maxHH?: string; maxMM?: string }) ?? {};
  const maxAttempts = (meta.maxAttempts as string) ?? '';
  const submitConfirmation = (meta.submitConfirmation as string) ?? 'Disable';
  const summaryType = (meta.summaryType as string) ?? '';
  const showTimer = (meta.showTimer as boolean) ?? true;

  const patch = useCallback((key: string, value: unknown) => {
    if (!nodeId) return;
    updateNode(nodeId, { [key]: value });
  }, [nodeId, updateNode]);

  return (
    <div className={styles.form}>
      <div className={styles.grid}>

        <div className={styles.field}>
          <label className={styles.label}>Set Maximum Time</label>
          <div className={styles.timeRow}>
            <input type="text" className={`${styles.input} ${styles.timeBox}`}
              placeholder="HH" maxLength={2} value={timeLimits.maxHH ?? ''}
              readOnly={readOnly}
              onChange={e => patch('timeLimits', { ...timeLimits, maxHH: e.target.value })} />
            <span className={styles.timeSep}>:</span>
            <input type="text" className={`${styles.input} ${styles.timeBox}`}
              placeholder="mm" maxLength={2} value={timeLimits.maxMM ?? ''}
              readOnly={readOnly}
              onChange={e => patch('timeLimits', { ...timeLimits, maxMM: e.target.value })} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Max Attempts</label>
          <select className={styles.select} value={maxAttempts}
            disabled={readOnly} onChange={e => patch('maxAttempts', e.target.value)}>
            <option value="" disabled>Select…</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="Unlimited">Unlimited</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Submit Confirmation Page</label>
          <select className={styles.select} value={submitConfirmation}
            disabled={readOnly} onChange={e => patch('submitConfirmation', e.target.value)}>
            <option>Disable</option>
            <option>Enable</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Summary Type</label>
          <select className={styles.select} value={summaryType}
            disabled={readOnly} onChange={e => patch('summaryType', e.target.value)}>
            <option value="" disabled>Select…</option>
            <option value="Score">Score</option>
            <option value="Detailed feedback">Detailed feedback</option>
          </select>
        </div>

        <div className={styles.divider} />

        <label className={styles.checkRow}>
          <input type="checkbox" className={styles.checkbox} checked={showTimer}
            disabled={readOnly} onChange={e => patch('showTimer', e.target.checked)} />
          Show timer to the learner
        </label>

      </div>
    </div>
  );
};

export default SetBehaviourForm;
