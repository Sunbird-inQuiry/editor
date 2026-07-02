/**
 * QuestionDetail — the Question tab for a selected question node.
 *
 * Uses the QuML player (inline) for the preview like the old editor's
 * non-edit-mode question view, instead of hand-rolled per-type cards —
 * so every question type renders exactly as learners see it.
 */
import React, { lazy, Suspense } from 'react';
import { Icon } from '../shared/Icon';
import { useTreeStore } from '../../store/tree.store';
import type { INode } from '../../types/editor';

const QumlPlayer = lazy(() => import('../QumlPlayer/QumlPlayer'));

interface QuestionDetailProps {
  node: INode;
  onOpenEditor: () => void;
  onRemove: () => void;
  isEditMode?: boolean;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({
  node,
  onOpenEditor,
  onRemove,
  isEditMode = true,
}) => {
  const rootId = useTreeStore((s) => s.treeData[0]?.identifier ?? '');
  // A question that has never been saved/authored has nothing to play.
  const hasContent = !!(node.metadata?.body ?? node.metadata?.editorState);

  return (
    <>
      {hasContent ? (
        <Suspense
          fallback={
            <p style={{ color: 'var(--sb-text-faint)', fontSize: 14 }}>Loading preview…</p>
          }
        >
          <QumlPlayer
            key={node.identifier}
            inline
            questionSetId={rootId}
            singleQuestionId={node.identifier}
          />
        </Suspense>
      ) : (
        <p style={{ color: 'var(--sb-text-faint)', fontSize: 14 }}>
          No content yet — open the editor to author this question.
        </p>
      )}

      {isEditMode && (
        <div className="ce-qactions">
          <button className="ce-btn primary" onClick={onOpenEditor} type="button">
            <Icon name="edit-sm" size={15} />Open in editor
          </button>
          <button className="ce-btn danger" onClick={onRemove} type="button">
            <Icon name="trash" size={15} />Remove
          </button>
        </div>
      )}
    </>
  );
};

export default QuestionDetail;
