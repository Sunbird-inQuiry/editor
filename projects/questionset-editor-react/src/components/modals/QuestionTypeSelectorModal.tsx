import React from 'react';
import { Icon } from '../shared/Icon';
import { useUiStore } from '../../store/ui.store';
import { useTreeStore } from '../../store/tree.store';
import type { QuestionType } from '../../types/question';

// ---------------------------------------------------------------------------
// Question type definitions — order matches the design's 2×3 grid
// ---------------------------------------------------------------------------

const TYPES: { type: QuestionType; label: string; desc: string; icon: string }[] = [
  { type: 'mcq', label: 'Multiple Choice',    desc: 'Pick one correct option from a list',         icon: 'check'   },
  { type: 'sa',  label: 'Subjective',         desc: 'Free-form written or long answer',            icon: 'doc'     },
  { type: 'ftb', label: 'Fill in the Blank',  desc: 'Hide words in a sentence with [[ ]]',         icon: 'edit-sm' },
  { type: 'mtf', label: 'Match the Following',desc: 'Pair items across two columns',               icon: 'link'    },
  { type: 'seq', label: 'Sequence',           desc: 'Arrange items in the correct order',          icon: 'numlist' },
  { type: 'reo', label: 'Reorder',            desc: 'Rearrange shuffled words into a sentence',    icon: 'swap'    },
  { type: 'boolean', label: 'True / False',   desc: 'Pick between true or false choices',          icon: 'check'   },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const QuestionTypeSelectorModal: React.FC = () => {
  const activeModal          = useUiStore((s) => s.activeModal);
  const modalData            = useUiStore((s) => s.modalData);
  const closeModal           = useUiStore((s) => s.closeModal);
  const setPendingEditorOpen = useUiStore((s) => s.setPendingEditorOpen);
  const addNode              = useTreeStore((s) => s.addNode);

  if (activeModal !== 'questionTypeSelector') return null;

  const parentId = (modalData.parentId as string | undefined) ?? '';

  const handleSelect = (type: QuestionType) => {
    const newId = addNode(parentId, 'question', type);
    closeModal();
    // Signal ContextualEditor to open inline editor immediately for the new question
    setPendingEditorOpen(newId);
  };

  return (
    <div className="ce-modal-scrim" onMouseDown={closeModal}>
      <div className="qp" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="qp-title">

        {/* Close button */}
        <button className="qp-x" onClick={closeModal} aria-label="Close" type="button">
          <Icon name="x" size={18} />
        </button>

        {/* Header */}
        <div className="qp-head">
          <span className="kicker">New question</span>
          <h2 id="qp-title">What would you like to create?</h2>
          <p>Choose a question type — you can change it later.</p>
        </div>

        {/* 2×3 grid */}
        <div className="qp-grid">
          {TYPES.map(({ type, label, desc, icon }) => (
            <button
              key={type}
              type="button"
              className="qp-card"
              onClick={() => handleSelect(type)}
            >
              <span className="qp-card-ic">
                <Icon name={icon} size={20} />
              </span>
              <span className="qp-card-tx">
                <span className="t">{label}</span>
                <span className="d">{desc}</span>
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default QuestionTypeSelectorModal;
