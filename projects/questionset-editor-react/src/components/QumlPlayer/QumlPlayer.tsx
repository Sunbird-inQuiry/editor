/**
 * QumlPlayer — wraps the Sunbird QuML Player web component.
 *
 * Renders a full-screen overlay with a preview of the question set.
 * When the actual @project-sunbird/quml-player web component is wired up,
 * replace the placeholder section with the real <sunbird-quml-player> element.
 */
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTreeStore } from '../../store/tree.store';
import type { INode } from '../../types/editor';
import styles from './QumlPlayer.module.scss';

// ---------------------------------------------------------------------------
// Ambient declaration for the Sunbird QuML Player web component
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'sunbird-quml-player': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'player-config'?: string;
        },
        HTMLElement
      >;
    }
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QumlPlayerProps {
  /** Identifier of the question set being previewed. */
  questionSetId: string;
  /** Called when the user closes the preview overlay. */
  onClose?: () => void;
}

interface PlayerConfig {
  context: {
    mode: 'play';
    threshold?: number;
    maxQuestions?: number;
    shuffle?: boolean;
    showTimer?: boolean;
  };
  metadata: {
    identifier: string;
    name: string;
    objectType: string;
    primaryCategory: string;
    [key: string]: unknown;
  };
  data: {
    name: string;
    identifier: string;
    children: unknown[];
    [key: string]: unknown;
  };
}

// ---------------------------------------------------------------------------
// Helper — flatten INode tree into a flat question list
// ---------------------------------------------------------------------------

function collectQuestions(nodes: INode[]): INode[] {
  const questions: INode[] = [];
  const walk = (list: INode[]) => {
    for (const node of list) {
      if (node.isQuestion) {
        questions.push(node);
      }
      if (node.children?.length) {
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return questions;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const QumlPlayer: React.FC<QumlPlayerProps> = ({ questionSetId, onClose }) => {
  const treeData = useTreeStore((s) => s.treeData);
  const rootNode = treeData[0];
  const playerRef = useRef<HTMLElement | null>(null);
  const playerConfigRef = useRef<PlayerConfig | null>(null);

  // Build player config when component mounts / rootNode changes
  useEffect(() => {
    if (!rootNode) return;

    const config: PlayerConfig = {
      context: {
        mode: 'play',
        threshold: 3,
        maxQuestions: rootNode.metadata?.maxQuestions as number | undefined,
        shuffle: (rootNode.metadata?.shuffle as boolean | undefined) ?? false,
        showTimer: (rootNode.metadata?.showTimer as boolean | undefined) ?? false,
      },
      metadata: {
        identifier: questionSetId || rootNode.identifier,
        name: rootNode.name,
        objectType: (rootNode.metadata?.objectType as string | undefined) ?? 'QuestionSet',
        primaryCategory:
          (rootNode.metadata?.primaryCategory as string | undefined) ?? 'Practice Question Set',
        ...(rootNode.metadata ?? {}),
      },
      data: {
        name: rootNode.name,
        identifier: questionSetId || rootNode.identifier,
        children: rootNode.children ?? [],
        ...(rootNode.metadata ?? {}),
      },
    };

    playerConfigRef.current = config;

    // If the web component is already registered, initialise it
    const el = playerRef.current;
    if (el) {
      el.setAttribute('player-config', JSON.stringify(config));
    }
  }, [rootNode, questionSetId]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const questions = collectQuestions(treeData);
  const previewQuestions = questions.slice(0, 5);

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Question Set Preview"
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>
          Preview — {rootNode?.name ?? 'Question Set'}
        </span>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => onClose?.()}
          aria-label="Close preview"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Player container */}
      <div className={styles.playerContainer}>
        {/*
          When @project-sunbird/quml-player is installed and registered, replace
          the preview card below with:

            <sunbird-quml-player
              ref={playerRef}
              player-config={JSON.stringify(playerConfigRef.current)}
            />

          The web component emits `playerEvent` and `telemetryEvent` on the host element.
        */}

        <div className={styles.playerPreview}>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>
            {rootNode?.name ?? 'Question Set'}
          </h2>
          <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: 14 }}>
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </p>

          {questions.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 13 }}>
              No questions found. Add questions to the question set to preview them here.
            </p>
          ) : (
            <>
              <ol className={styles.questionList}>
                {previewQuestions.map((q) => (
                  <li key={q.id}>
                    <span>{q.name}</span>
                    {q.questionType && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {q.questionType}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              {questions.length > 5 && (
                <p style={{ marginTop: 8, fontSize: 13, color: '#9ca3af' }}>
                  …and {questions.length - 5} more question{questions.length - 5 !== 1 ? 's' : ''}
                </p>
              )}
            </>
          )}

          <p
            style={{
              marginTop: 24,
              fontSize: 12,
              color: '#d1d5db',
              borderTop: '1px solid #f3f4f6',
              paddingTop: 16,
            }}
          >
            Live preview requires the{' '}
            <code
              style={{
                fontFamily: 'monospace',
                background: '#f3f4f6',
                borderRadius: 3,
                padding: '1px 4px',
              }}
            >
              @project-sunbird/quml-player
            </code>{' '}
            web component to be registered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QumlPlayer;
