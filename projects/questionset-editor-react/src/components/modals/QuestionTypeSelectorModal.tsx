import React from 'react';
import {
  CircleDot, CheckSquare, AlignLeft, Underline,
  Shuffle, List, ArrowUpDown, SlidersHorizontal,
} from 'lucide-react';
import Modal from '../shared/Modal';
import { useUiStore } from '../../store/ui.store';
import { useTreeStore } from '../../store/tree.store';
import type { QuestionType } from '../../types/question';
import { QUESTION_TYPE_LABELS } from '../../types/question';
import styles from './QuestionTypeSelectorModal.module.scss';

const TYPE_ICONS: Record<QuestionType, React.ReactNode> = {
  mcq:    <CircleDot size={20} />,
  msq:    <CheckSquare size={20} />,
  sa:     <AlignLeft size={20} />,
  ftb:    <Underline size={20} />,
  mtf:    <Shuffle size={20} />,
  seq:    <List size={20} />,
  reo:    <ArrowUpDown size={20} />,
  slider: <SlidersHorizontal size={20} />,
};

const ALL_TYPES: QuestionType[] = ['mcq', 'msq', 'sa', 'ftb', 'mtf', 'seq', 'reo', 'slider'];

export const QuestionTypeSelectorModal: React.FC = () => {
  const activeModal = useUiStore((s) => s.activeModal);
  const modalData  = useUiStore((s) => s.modalData);
  const closeModal = useUiStore((s) => s.closeModal);
  const addNode    = useTreeStore((s) => s.addNode);

  if (activeModal !== 'questionTypeSelector') return null;

  const parentId = (modalData.parentId as string | undefined) ?? '';

  const handleSelect = (type: QuestionType) => {
    addNode(parentId, 'question', type);
    closeModal();
  };

  return (
    <Modal
      title="Select Question Type"
      isOpen
      onClose={closeModal}
      size="md"
    >
      <div className={styles.grid}>
        {ALL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={styles.typeCard}
            onClick={() => handleSelect(type)}
          >
            <span className={styles.icon}>{TYPE_ICONS[type]}</span>
            <span className={styles.label}>{QUESTION_TYPE_LABELS[type]}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default QuestionTypeSelectorModal;
