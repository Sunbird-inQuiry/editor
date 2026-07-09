import React, { useState, useMemo } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { useEditorStore } from '../../store/editor.store';
import type { ICategoryField } from '../../api/categoryDefinition';
import { useLabels } from '../../hooks/useLabels';
import styles from './PublishChecklist.module.scss';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface PublishChecklistProps {
  contentId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const PublishChecklist: React.FC<PublishChecklistProps> = ({
  contentId: _contentId,
  onConfirm,
  onCancel,
}) => {
  const L = useLabels();
  const configuredChecklist = useEditorStore((s) => s.publishChecklist);

  // No fallback list — matches the old editor's PublishChecklistComponent,
  // which shows a plain confirmation (no checkboxes) when the category
  // definition has no `forms.publishchecklist` configured.
  const checklistItems = useMemo<ICategoryField[]>(
    () => (configuredChecklist ?? []).filter((f) => f.visible !== false),
    [configuredChecklist],
  );

  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(checklistItems.map((item) => [item.code, false])),
  );

  // Old editor: isButtonEnable = _.isEmpty(publishchecklist) ? true : false —
  // an unconfigured checklist never blocks publishing.
  const allChecked = useMemo(
    () => checklistItems.length === 0 || checklistItems.every((item) => checked[item.code]),
    [checked, checklistItems],
  );

  const toggle = (code: string) => {
    setChecked((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        {L('button_labels.cancel_btn_label', 'Cancel')}
      </Button>
      <Button variant="primary" disabled={!allChecked} onClick={onConfirm}>
        {L('button_labels.publish_collection_btn_label', 'Publish')}
      </Button>
    </>
  );

  return (
    <Modal
      title={L('lbl.publishCollection', 'Publish ${objectType}').replace('${objectType}', 'Question Set')}
      isOpen
      onClose={onCancel}
      footer={footer}
      size="md"
    >
      <div className={styles.root}>
        {checklistItems.length === 0 ? (
          <p className={styles.intro}>
            {L('lbl.confirmPublishCollection', 'Are you sure you want to publish this ${objectType}?').replace('${objectType}', 'Question Set')}
          </p>
        ) : (
          <>
            <p className={styles.intro}>
              {L('lbl.publishchecklistTitle', 'Please confirm that ALL the following items are verified (by ticking the check-boxes) before you can publish:')}
            </p>

            <ul className={styles.checklist} role="list">
              {checklistItems.map((item) => {
                const isChecked = checked[item.code] ?? false;
                const labelId = `publish-check-label-${item.code}`;
                return (
                  <li key={item.code} className={styles.item}>
                    <label className={styles.itemLabel} htmlFor={`publish-check-${item.code}`}>
                      <input
                        id={`publish-check-${item.code}`}
                        type="checkbox"
                        className={styles.checkbox}
                        checked={isChecked}
                        onChange={() => toggle(item.code)}
                        aria-labelledby={labelId}
                      />
                      <span
                        className={`${styles.customCheck} ${isChecked ? styles.customCheckChecked : ''}`}
                        aria-hidden="true"
                      />
                      <span id={labelId} className={styles.itemText}>
                        {item.label}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </Modal>
  );
};

export { PublishChecklist };
export default PublishChecklist;
