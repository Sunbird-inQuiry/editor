/**
 * QumlPlayer — full-screen preview using the Sunbird QuML Player web
 * component (@project-sunbird/sunbird-quml-player-web-component-react).
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
import { listQuestions } from '../../api/question';
import type { INode } from '../../types/editor';
import styles from './QumlPlayer.module.scss';
import { useLabels } from '../../hooks/useLabels';

const PLAYER_TAG = 'sunbird-quml-player';
const DEFAULT_PLAYER_SCRIPT = '/assets/sunbird-quml-player.js';

interface QumlPlayerProps {
  /** Identifier of the question set being previewed. */
  questionSetId: string;
  /** When set, previews just this question (old editor question preview). */
  singleQuestionId?: string;
  /** Render embedded in the page instead of a full-screen overlay. */
  inline?: boolean;
  onClose?: () => void;
}

function loadPlayerScript(src: string): Promise<void> {
  // No global stylesheet link: the React player renders in shadow DOM with
  // its own styles, and its styles.css contains unscoped rules that leak
  // into (and break) the editor layout once injected into document.head.
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

const QumlPlayer: React.FC<QumlPlayerProps> = ({ questionSetId, singleQuestionId, inline = false, onClose }) => {
  const L = useLabels();
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

        // Full-set preview used to re-read the hierarchy here (old
        // setUpdatedTreeNodeData), but the player web component re-fetches
        // the hierarchy itself once mounted — that made every full-set
        // preview fire the read call twice. Seed it from the in-memory tree
        // instead; the player's own fetch brings it fully up to date.
        let metadata: Record<string, unknown> = treeData[0] ? nodeToHierarchy(treeData[0]) : {};

        if (singleQuestionId) {
          // Old question.component.previewContent single-question settings.
          // Fetch the question via question/v2/list (old editor call) and
          // EMBED it with its body — the react player only honours embedded
          // metadata when a question carries body/interactions; otherwise it
          // re-fetches the full hierarchy and previews the entire set.
          const qNode = bfsFind(treeData, singleQuestionId);
          let qFull: Record<string, unknown> = { ...(qNode?.metadata ?? {}) };
          try {
            const [fetched] = await listQuestions([singleQuestionId]);
            if (fetched) qFull = { ...qFull, ...fetched };
          } catch { /* fall back to tree metadata */ }
          const qMeta = {
            ...qFull,
            identifier: singleQuestionId,
            name: qNode?.name ?? 'Question',
            mimeType: 'application/vnd.sunbird.question',
            objectType: 'Question',
            visibility: 'Parent',
          };
          // Keep the question inside its real section wrapper so the player's
          // section walker finds it in the same shape as a hierarchy read.
          const parentNode = qNode?.parent ? bfsFind(treeData, qNode.parent) : undefined;
          const children = parentNode?.isFolder
            ? [{
                ...(parentNode.metadata ?? {}),
                identifier: parentNode.identifier,
                name: parentNode.name,
                childNodes: [singleQuestionId],
                children: [qMeta],
              }]
            : [qMeta];
          metadata = {
            ...metadata,
            childNodes: [singleQuestionId],
            children,
            maxQuestions: 1,
            showStartPage: 'No',
            showTimer: false,
            requiresSubmit: 'No',
            shuffle: false,
          };
        }

        // Set-level "Max Attempts" (Behaviour tab) was authored onto the root
        // node's metadata but never reached the player's config — it fell
        // back to the player's own default every time.
        const maxAttemptsRaw = treeData[0]?.metadata?.maxAttempts;
        const maxAttemptsNum = Number(maxAttemptsRaw);
        const maxAttempts = Number.isFinite(maxAttemptsNum) && maxAttemptsNum > 0 ? maxAttemptsNum : undefined;

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
            // Disable the player's hamburger side menu in editor previews —
            // it renders viewport-fixed and escapes the preview container.
            sideMenu: { enable: false, showShare: false, showDownload: false, showExit: false },
            ...(singleQuestionId ? { showLegend: false } : {}),
            ...(maxAttempts !== undefined ? { maxAttempts } : {}),
          },
          metadata,
          data: {},
        };

        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = '';
        const el = document.createElement(PLAYER_TAG) as HTMLElement & { playerConfig?: unknown };
        // The React player parses the player-config ATTRIBUTE once in
        // connectedCallback — it must be set before appending. The property
        // is kept for the old Angular WC bundle (playerScriptUrl override).
        el.setAttribute('player-config', JSON.stringify(playerConfig));
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

  // Status messages live OUTSIDE the manually-managed host div — the player
  // is appended imperatively and must not fight React's children.
  const statusEl = (
    <>
      {status === 'loading' && (
        <p style={{ textAlign: 'center', color: '#888', padding: 40, margin: 0 }}>{L('ui.loadingPreview', 'Loading preview…')}</p>
      )}
      {status === 'error' && (
        <p style={{ textAlign: 'center', color: '#c33', padding: 40, margin: 0 }}>
          {L('ui.previewUnavailable', 'Could not load the QuML player. Please try again.')}
        </p>
      )}
    </>
  );

  if (inline) {
    return (
      <div style={{ minHeight: status === 'ready' ? 420 : undefined }}>
        {statusEl}
        <div ref={hostRef} />
      </div>
    );
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={L('button_labels.preview_collection_btn_label', 'Preview')}>
      <div className={styles.header}>
        <span className={styles.title}>
          {L('button_labels.preview_collection_btn_label', 'Preview')} — {rootName ?? L('ui.questionSet', 'Question Set')}
        </span>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => onClose?.()}
          aria-label={L('ui.closePreview', 'Close preview')}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.playerContainer}>
        {statusEl}
        {/* Full width/height so the player lays out in desktop mode */}
        <div ref={hostRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default QumlPlayer;
