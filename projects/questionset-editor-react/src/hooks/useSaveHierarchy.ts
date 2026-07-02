import { useState, useCallback } from 'react';
import { useTreeStore } from '../store/tree.store';
import { useEditorStore } from '../store/editor.store';
import { updateHierarchy } from '../api/hierarchy';
import type { INode } from '../types/editor';
import toast from 'react-hot-toast';

function buildSavePayload(
  nodes: INode[],
  treeCache: Record<string, Record<string, unknown>>,
  channel: string,
  rootPrimaryCategory: string,
): { nodesModified: Record<string, unknown>; hierarchy: Record<string, unknown> } {
  const nodesModified: Record<string, unknown> = {};
  const hierarchy: Record<string, unknown> = {};

  // 'metadata' is stripped to prevent a nested metadata.metadata property
  // that the hierarchy update API rejects with CLIENT_ERROR.
  const BASE_STRIP = new Set(['id', 'isFolder', 'isQuestion', 'children', 'parent', 'isNew', 'breadcrumb', 'title', 'metadata']);
  const ARRAY_FIELDS  = new Set(['audience', 'medium', 'gradeLevel', 'subject', 'keywords', 'language', 'topic']);
  const NUMBER_FIELDS = new Set(['copyrightYear', 'maxScore', 'expectedDuration', 'maxAttempts']);
  // maxTime is a form-only field (seconds integer). The backend stores it
  // inside timeLimits.questionSet.max — it is NOT a direct schema property.
  const MAX_TIME_FIELDS = new Set(['maxTime']);

  function cleanMetadata(raw: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (BASE_STRIP.has(k)) continue;
      if (MAX_TIME_FIELDS.has(k)) continue;   // handled after the loop
      if (ARRAY_FIELDS.has(k)) {
        out[k] = Array.isArray(v) ? v : (v != null && v !== '' ? [v] : []);
      } else if (NUMBER_FIELDS.has(k)) {
        const n = Number(v);
        if (!isNaN(n)) out[k] = n;
      } else {
        out[k] = v;
      }
    }
    // Convert maxTime (seconds) → timeLimits.questionSet.max
    if (raw.maxTime !== undefined) {
      const secs = Number(raw.maxTime) || 0;
      const existing = (out.timeLimits as Record<string, unknown> | undefined) ?? {};
      out.timeLimits = { ...existing, questionSet: { max: secs, min: 0 } };
    }
    return out;
  }

  function walk(node: INode, isRoot: boolean) {
    const identifier = node.identifier;
    const cached = treeCache[identifier];
    const isNew = identifier.startsWith('temp-') || !!(cached?.isNew);
    const isLeaf = node.isQuestion ?? false;

    if (isRoot || isNew || (cached && !isLeaf)) {
      let metadata: Record<string, unknown>;
      if (isNew) {
        metadata = {
          mimeType: node.isQuestion
            ? 'application/vnd.sunbird.question'
            : 'application/vnd.sunbird.questionset',
          objectType: node.isQuestion ? 'Question' : 'QuestionSet',
          // Sections inherit the root's primaryCategory so the backend can
          // resolve obj-cat:practice-question-set_questionset_all correctly.
          primaryCategory: node.isQuestion
            ? ((node.metadata?.primaryCategory as string) ?? 'Multiple Choice Question')
            : rootPrimaryCategory,
          code: identifier,
          name: node.name,
          visibility: 'Parent',
          channel,
          ...cleanMetadata(node.metadata ?? {}),
        };
      } else if (isRoot) {
        // Send only explicitly-edited fields (treeCache), not all server-side
        // metadata. The old Angular editor does the same — it never sends
        // system fields like channel, mimeType, language, childNodes, etc.
        const { isNew: _, ...cacheEdits } = cached ?? {};
        metadata = { name: node.name, ...cleanMetadata(cacheEdits) };
      } else {
        const { isNew: _, ...cacheEdits } = cached ?? {};
        metadata = { name: node.name, visibility: 'Parent', ...cleanMetadata(cacheEdits) };
      }

      nodesModified[identifier] = {
        metadata,
        objectType: node.isQuestion ? 'Question' : 'QuestionSet',
        root: isRoot,
        isNew,
      };
    }

    // Questions must NOT appear as keys in hierarchy — only sections/root go here.
    // Questions are listed as children of their parent section but have no own entry.
    if (!isLeaf) {
      hierarchy[identifier] = {
        name: node.name,
        children: (node.children ?? []).map((c) => c.identifier),
        root: isRoot,
      };
    }

    (node.children ?? []).forEach((child) => walk(child, false));
  }

  nodes.forEach((node, i) => walk(node, i === 0));
  return { nodesModified, hierarchy };
}

export function useSaveHierarchy() {
  const [isSaving, setIsSaving] = useState(false);

  const treeCache = useTreeStore((s) => s.treeCache);
  const treeData = useTreeStore((s) => s.treeData);
  const isDirty = useEditorStore((s) => s.isDirty);
  const { setIsDirty, setLastSaved } = useEditorStore();
  const config = useEditorStore((s) => s.editorConfig);
  const replaceNodeId = useTreeStore((s) => s.replaceNodeId);

  const save = useCallback(async () => {
    if (!config || isSaving) return;
    const contentId = config.context.contentId ?? config.context.identifier ?? '';
    if (!contentId) return;

    const channel = config.context.channel ?? '';
    const lastUpdatedBy = config.context.userId ?? config.context.uid ?? '';

    setIsSaving(true);
    try {
      const rootPrimaryCategory = config.config.primaryCategory ?? 'Practice Question Set';
      const { nodesModified, hierarchy } = buildSavePayload(treeData, treeCache, channel, rootPrimaryCategory);
      const { identifiers } = await updateHierarchy(contentId, nodesModified, hierarchy, lastUpdatedBy);
      // Swap temp- IDs with the real identifiers returned by the backend
      for (const [tempId, realId] of Object.entries(identifiers)) {
        replaceNodeId(tempId, realId);
      }
      setLastSaved(new Date().toISOString());
      setIsDirty(false);
    } catch (e) {
      console.error('[useSaveHierarchy] save failed:', e);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [config, isSaving, treeData, treeCache, setIsDirty, setLastSaved]);

  return { save, isSaving, isDirty, lastSaved: useEditorStore.getState().lastSaved };
}
