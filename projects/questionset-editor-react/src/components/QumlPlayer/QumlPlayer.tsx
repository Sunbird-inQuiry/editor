/**
 * QumlPlayer — full-screen preview using the Sunbird QuML Player web
 * component (@project-sunbird/sunbird-quml-player-web-component@6.0.10,
 * until the new player is published).
 *
 * Mirrors the old editor's two preview flows:
 *  - Full question-set preview (toolbar): fresh hierarchy read → player
 *  - Single-question preview (question editor): threshold 1, no start
 *    page/timer/submit, no legend
 *
 * The player script is loaded dynamically (old editor pattern) from
 * config.playerScriptUrl, defaulting to /assets/sunbird-quml-player.js.
 */
import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useTreeStore } from '../../store/tree.store';
import { useEditorStore } from '../../store/editor.store';
import { readHierarchy } from '../../api/hierarchy';
import type { INode } from '../../types/editor';
import styles from './QumlPlayer.module.scss';

const PLAYER_TAG = 'sunbird-quml-player';
const DEFAULT_PLAYER_SCRIPT = '/assets/sunbird-quml-player.js';

interface QumlPlayerProps {
  /** Identifier of the question set being previewed. */
  questionSetId: string;
  /** When set, previews just this question (old editor question preview). */
  singleQuestionId?: string;
  onClose?: () => void;
}

function loadPlayerScript(src: string): Promise<void> {
  // Player styles ship separately (old Angular app included them globally).
  const cssHref = src.replace(/\.js$/, '-styles.css');
  if (!document.querySelector(`link[href="${cssHref}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssHref;
    document.head.appendChild(link);
  }
  return new Promise((resolve, reject) => {
    if (customElements.get(PLAYER_TAG)) return resolve();
    const onDefined = () => customElements.whenDefined(PLAYER_TAG).then(() => resolve(), reject);
    if (document.querySelector(`script[src="${src}"]`)) return void onDefined();
    const script = document.createElement('script');
    script.src = src;
    script.onload = onDefined;
    script.onerror = () => reject(new Error(`Failed to load QuML player: ${src}`));
    document.head.appendChild(script);
  });
}

/** INode tree → raw hierarchy shape the player expects. */
function nodeToHierarchy(node: INode): Record<string, unknown> {
  return {
    ...(node.metadata ?? {}),
    identifier: node.identifier,
    name: node.name,
    children: (node.children ?? []).map(nodeToHierarchy),
  };
}

function bfsFind(nodes: INode[], id: string): INode | undefined {
  const queue = [...nodes];
  while (queue.length) {
    const n = queue.shift()!;
    if (n.id === id || n.identifier === id) return n;
    if (n.children) queue.push(...n.children);
  }
  return undefined;
}

const QumlPlayer: React.FC<QumlPlayerProps> = ({ questionSetId, singleQuestionId, onClose }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const rootName = useTreeStore((s) => s.treeData[0]?.name);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const editorConfig = useEditorStore.getState().editorConfig;
        const scriptUrl =
          ((editorConfig?.config as Record<string, unknown> | undefined)?.playerScriptUrl as string | undefined)
          ?? DEFAULT_PLAYER_SCRIPT;
        await loadPlayerScript(scriptUrl);

        const treeData = useTreeStore.getState().treeData;

        // Full-set preview re-reads the hierarchy (old setUpdatedTreeNodeData);
        // falls back to the in-memory tree if the read fails.
        let metadata: Record<string, unknown>;
        try {
          if (singleQuestionId || !questionSetId || questionSetId.startsWith('temp-')) throw new Error('local');
          const { content } = await readHierarchy(questionSetId);
          metadata = content;
        } catch {
          metadata = treeData[0] ? nodeToHierarchy(treeData[0]) : {};
        }

        if (singleQuestionId) {
          // Old question.component.previewContent single-question settings.
          const qNode = bfsFind(treeData, singleQuestionId);
          const qMeta = {
            ...(qNode?.metadata ?? {}),
            identifier: singleQuestionId,
            name: qNode?.name ?? 'Question',
          };
          metadata = {
            ...metadata,
            childNodes: [singleQuestionId],
            children: [qMeta],
            maxQuestions: 1,
            showStartPage: 'No',
            showTimer: false,
            requiresSubmit: 'No',
            shuffle: false,
          };
        }

        const ctx = (editorConfig?.context ?? {}) as Record<string, unknown>;
        const playerConfig = {
          context: {
            ...ctx,
            mode: 'play',
            threshold: singleQuestionId ? 1 : 3,
            userData: { firstName: '', lastName: '' },
          },
          config: {
            ...(editorConfig?.config ?? {}),
            sideMenu: { showShare: false, showDownload: false, showExit: false },
            ...(singleQuestionId ? { showLegend: false } : {}),
          },
          metadata,
          data: {},
        };

        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = '';
        const el = document.createElement(PLAYER_TAG) as HTMLElement & { playerConfig?: unknown };
        el.playerConfig = playerConfig;
        hostRef.current.appendChild(el);
        setStatus('ready');
      } catch (e) {
        console.error('[QumlPlayer] preview failed:', e);
        if (!cancelled) setStatus('error');
      }
    }

    void init();
    return () => { cancelled = true; };
  }, [questionSetId, singleQuestionId]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Preview">
      <div className={styles.header}>
        <span className={styles.title}>
          Preview — {rootName ?? 'Question Set'}
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

      <div className={styles.playerContainer} ref={hostRef}>
        {status === 'loading' && (
          <p style={{ textAlign: 'center', color: '#888', padding: 40 }}>Loading preview…</p>
        )}
        {status === 'error' && (
          <p style={{ textAlign: 'center', color: '#c33', padding: 40 }}>
            Could not load the QuML player. Ensure the player script is available
            (config.playerScriptUrl or /assets/sunbird-quml-player.js).
          </p>
        )}
      </div>
    </div>
  );
};

export default QumlPlayer;
