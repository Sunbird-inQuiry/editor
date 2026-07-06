/**
 * QuestionDetail — the Question tab for a selected question node.
 *
 * Uses the QuML player (inline) for the preview like the old editor's
 * non-edit-mode question view, instead of hand-rolled per-type cards —
 * so every question type renders exactly as learners see it.
 */
import React, { lazy, Suspense, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { Icon } from '../shared/Icon';
import { useTreeStore } from '../../store/tree.store';
import type { INode } from '../../types/editor';

const QumlPlayer = lazy(() => import('../QumlPlayer/QumlPlayer'));

interface QuestionDetailProps {
  node: INode;
  onOpenEditor: () => void;
  onRemove: () => void;
  isEditMode?: boolean;
  /** True while question/v2/read for this node is in flight. */
  isLoading?: boolean;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({
  node,
  onOpenEditor,
  onRemove,
  isEditMode = true,
  isLoading = false,
}) => {
  const rootId = useTreeStore((s) => s.treeData[0]?.identifier ?? '');
  const [portrait, setPortrait] = useState(false);
  // A question that has never been saved/authored has nothing to play.
  const hasContent = !!(node.metadata?.body ?? node.metadata?.editorState);

  return (
    <>
      {!hasContent && isLoading ? (
        <div className="ce-spinner-wrap">
          <span className="ce-spinner" aria-hidden="true" />
        </div>
      ) : hasContent ? (
        <>
          <div
            style={portrait ? {
              maxWidth: 375, minHeight: 660, margin: '0 auto',
              border: '2px solid var(--ink, #222)', borderRadius: 14,
              overflow: 'hidden', background: '#fff',
            } : undefined}
          >
            <Suspense
              fallback={
                <p style={{ color: 'var(--sb-text-faint)', fontSize: 14 }}>Loading preview…</p>
              }
            >
              <QumlPlayer
                key={`${node.identifier}-${portrait ? 'p' : 'l'}`}
                inline
                questionSetId={rootId}
                singleQuestionId={node.identifier}
              />
            </Suspense>
          </div>

          {/* Desktop / mobile preview toggle — old editor's qumlplayer-page */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setPortrait(false)}
              title="Desktop preview"
              aria-pressed={!portrait}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, color: 'var(--accent)', opacity: portrait ? 0.35 : 1 }}
            >
              <Monitor size={18} />
            </button>
            <span style={{ color: 'var(--sb-border)', fontSize: 16 }}>|</span>
            <button
              type="button"
              onClick={() => setPortrait(true)}
              title="Mobile preview"
              aria-pressed={portrait}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, color: 'var(--accent)', opacity: portrait ? 1 : 0.35 }}
            >
              <Smartphone size={21} />
            </button>
          </div>
        </>
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
