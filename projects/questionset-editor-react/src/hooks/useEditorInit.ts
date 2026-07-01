import { useState, useEffect } from 'react';
import type { IEditorConfig } from '../types/editor';
import { useEditorStore } from '../store/editor.store';
import { useTreeStore } from '../store/tree.store';
import { readHierarchy, readQuestionSet } from '../api/hierarchy';
import { useTreeStore as treeStoreModule } from '../store/tree.store';
import { getCategoryDefinition } from '../api/categoryDefinition';
import { setApiBaseUrl } from '../api/client';

interface UseEditorInitOptions {
  config: IEditorConfig;
  onError?: (e: Error) => void;
}

export function useEditorInit({ config, onError }: UseEditorInitOptions) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { setEditorConfig, setEditorMode, setCategoryDefinition, setReviewComments } = useEditorStore();
  const { setTreeData, selectNode, updateNode } = useTreeStore();

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setIsLoading(true);
        setError(null);

        if (config.apiBaseUrl) setApiBaseUrl(config.apiBaseUrl);

        setEditorConfig(config);
        setEditorMode(config.config.mode);

        const contentId = config.context.contentId ?? config.context.identifier ?? '';

        if (contentId) {
          const { rootNode } = await readHierarchy(contentId);
          if (!cancelled) {
            const nodes = rootNode ? [rootNode] : [];
            setTreeData(nodes);
            if (rootNode) selectNode(rootNode.id);
          }

          // Fetch fields not included in hierarchy (instructions, outcomeDeclaration).
          // Merge into the root node so the Details form shows the correct values.
          if (rootNode && !cancelled) {
            try {
              const extra = await readQuestionSet(contentId);
              if (!cancelled && Object.keys(extra).length > 0) {
                updateNode(rootNode.id, extra);
              }
            } catch { /* non-critical — form still renders without instructions */ }
          }

          const primaryCategory = config.config.primaryCategory ?? 'Question Set';
          const channel = config.context.channel ?? '';
          const apiVersion = config.config.categoryDefinitionApiVersion ?? 'v1';
          try {
            const parsed = await getCategoryDefinition(
              primaryCategory, channel, config.config.objectType ?? 'QuestionSet', apiVersion,
            );
            if (!cancelled) {
              setCategoryDefinition(parsed);

              const sourcing = (parsed.sourcingSettings?.collection as Record<string, unknown> | undefined) ?? {};
              const configPatch: Record<string, unknown> = {};
              if (sourcing.maxDepth && !config.config.maxDepth) configPatch.maxDepth = sourcing.maxDepth;
              if (Object.keys(configPatch).length > 0) {
                setEditorConfig({ ...config, config: { ...config.config, ...configPatch } });
              }
            }
          } catch {
            // silently fall back
          }

          if (config.config.mode !== 'read') {
            try {
              const { readComments } = await import('../api/comments');
              const comments = await readComments(contentId);
              if (!cancelled) setReviewComments(comments);
            } catch { /* silent */ }
          }
        }

        if (!cancelled) setIsReady(true);
      } catch (err) {
        if (!cancelled) {
          const e = err instanceof Error ? err : new Error(String(err));
          setError(e);
          onError?.(e);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.context.contentId, config.context.identifier]);

  return { isLoading, error, isReady };
}
