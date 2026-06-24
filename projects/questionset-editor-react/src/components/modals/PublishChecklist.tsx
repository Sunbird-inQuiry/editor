import React, { useState, useMemo } from 'react';
import { CheckSquare } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { useEditorStore } from '../../store/editor.store';
import type { ICategoryField } from '../../api/categoryDefinition';
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
// Default checklist items used when no publishChecklist is configured
// -----------------------------------------------------------------------------

const DEFAULT_CHECKLIST_ITEMS: ICategoryField[] = [
  {
    code: 'question_body',
    label: 'All questions have a question body',
    required: true,
    editable: false,
    visible: true,
  },
  {
    code: 'one_question_complete',
    label: 'At least one question is complete',
    required: true,
    editable: false,
    visible: true,
  },
  {
    code: 'metadata_filled',
    label: 'Metadata (title, description) is filled',
    required: true,
    editable: false,
    visible: true,
  },
  {
    code: 'section_exists',
    label: 'At least one section exists',
    required: true,
    editable: false,
    visible: true,
  },
];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const PublishChecklist: React.FC<PublishChecklistProps> = ({
  contentId: _contentId,
  onConfirm,
  onCancel,
}) => {
  const configuredChecklist = useEditorStore((s) => s.publishChecklist);

  const checklistItems = useMemo<ICategoryField[]>(() => {
    if (configuredChecklist && configuredChecklist.length > 0) {
      return configuredChecklist.filter((f) => f.visible !== false);
    }
    return DEFAULT_CHECKLIST_ITEMS;
  }, [configuredChecklist]);

  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(checklistItems.map((item) => [item.code, false])),
  );

  const allChecked = useMemo(
    () => checklistItems.every((item) => checked[item.code]),
    [checked, checklistItems],
  );

  const toggle = (code: string) => {
    setChecked((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="primary" disabled={!allChecked} onClick={onConfirm}>
        Publish
      </Button>
    </>
  );

  return (
    <Modal
      title="Publish Question Set"
      isOpen
      onClose={onCancel}
      footer={footer}
      size="md"
    >
      <div className={styles.root}>
        <p className={styles.intro}>
          Please confirm all items below before publishing this Question Set.
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
                  >
                    {isChecked && <CheckSquare size={14} strokeWidth={2.5} />}
                  </span>
                  <span id={labelId} className={styles.itemText}>
                    {item.label}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        {!allChecked && (
          <p className={styles.hint} role="note">
            Check all items to enable the Publish button.
          </p>
        )}
      </div>
    </Modal>
  );
};

export { PublishChecklist };
export default PublishChecklist;
