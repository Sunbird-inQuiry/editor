import { useState, useCallback } from 'react';
import { useTreeStore } from '../store/tree.store';
import { useEditorStore } from '../store/editor.store';
import { updateHierarchy } from '../api/hierarchy';
import type { INode } from '../types/editor';
import { getContentId, getUserId } from '../utils/context';
import toast from 'react-hot-toast';

function buildSavePayload(
  nodes: INode[],
  treeCache: Record<string, Record<string, unknown>>,
  channel: string,
  rootPrimaryCategory: string,
): { nodesModified: Record<string, unknown>; hierarchy: Record<string, unknown> } {
  const nodesModified: Record<string, unknown> = {};
  const hierarchy: Record<string, unknown> = {};

  // Fields stripped from all node metadata before the hierarchy save.
  // 'questionType' is rejected by the v5 schema as an unknown property.
  const BASE_STRIP = new Set([
    'id', 'isFolder', 'isQuestion', 'children', 'parent', 'isNew', 'breadcrumb', 'title', 'metadata', 'questionType', 'objectType',
    // System/read-only fields hydrated from question/v2/read — the backend
    // rejects index/depth and manages the rest itself; old editor never sends them.
    'index', 'depth', 'status', 'versionKey', 'createdOn', 'lastUpdatedOn', 'lastStatusChangedOn',
  ]);
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

    // A question node that still has a temp- identifier has NOT been through
    // "Save question" yet (useSaveQuestion replaces temp- with a UUID before
    // saving). Exclude it from nodesModified and from hierarchy children so the
    // hierarchy API only receives fully-formed question metadata.
    if (isLeaf && identifier.startsWith('temp-')) {
      return;
    }

    // Include: root, new nodes, any cached node (including existing questions).
    // Old editor always sends full question metadata for both new + modified questions.
    if (isRoot || isNew || cached) {
      let metadata: Record<string, unknown>;
      if (isNew) {
        if (isLeaf) {
          // New question — full metadata built by useSaveQuestion lives in
          // treeCache (updateNode does not merge patches into node.metadata).
          const { isNew: _, ...cacheEdits } = cached ?? {};
          metadata = { ...cleanMetadata({ ...(node.metadata ?? {}), ...cacheEdits }) };
        } else {
          // New section
          metadata = {
            mimeType: 'application/vnd.sunbird.questionset',
            primaryCategory: rootPrimaryCategory,
            code: identifier,
            name: node.name,
            visibility: 'Parent',
            channel,
            ...cleanMetadata(node.metadata ?? {}),
          };
        }
      } else if (isLeaf) {
        // Existing modified question — send full metadata stored by useSaveQuestion.
        const { isNew: _, ...cacheEdits } = cached ?? {};
        metadata = { ...cleanMetadata({ ...(node.metadata ?? {}), ...cacheEdits }) };
      } else if (isRoot) {
        const { isNew: _, ...cacheEdits } = cached ?? {};
        metadata = { name: node.name, ...cleanMetadata(cacheEdits) };
      } else {
        const { isNew: _, ...cacheEdits } = cached ?? {};
        metadata = { name: node.name, visibility: 'Parent', ...cleanMetadata(cacheEdits) };
      }

      // Old editor never sends code/visibility/identifier for questions in
      // nodesModified (a stale identifier makes the backend treat the node
      // inconsistently).
      if (isLeaf) {
        delete metadata['code'];
        delete metadata['visibility'];
        delete metadata['identifier'];
      }

      nodesModified[identifier] = {
        metadata,
        objectType: node.isQuestion ? 'Question' : 'QuestionSet',
        root: isRoot,
        isNew,
      };
    }

    // Questions must NOT appear as keys in hierarchy — only sections/root go here.
    // Exclude temp- question identifiers from children (unsaved questions).
    if (!isLeaf) {
      hierarchy[identifier] = {
        name: node.name,
        children: (node.children ?? [])
          .filter(c => !(c.isQuestion && c.identifier.startsWith('temp-')))
          .map(c => c.identifier),
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

  const isDirty = useEditorStore((s) => s.isDirty);
  const { setIsDirty, setLastSaved } = useEditorStore();
  const config = useEditorStore((s) => s.editorConfig);

  const save = useCallback(async () => {
    if (!config || isSaving) return;
    const contentId = getContentId(config.context);
    if (!contentId) return;

    const channel = config.context.channel ?? '';
    const lastUpdatedBy = getUserId(config.context);

    setIsSaving(true);
    try {
      const rootPrimaryCategory = config.config.primaryCategory ?? 'Practice Question Set';
      // Read treeData + treeCache from the store at call-time, not from the
      // React closure — prevents stale data when saveHierarchy() is called
      // immediately after replaceNodeId() + updateNode() in useSaveQuestion.
      const { treeData, treeCache, replaceNodeId } = useTreeStore.getState();
      const { nodesModified, hierarchy } = buildSavePayload(treeData, treeCache, channel, rootPrimaryCategory);
      const { identifiers } = await updateHierarchy(contentId, nodesModified, hierarchy, lastUpdatedBy);
      // Swap temp- IDs with the real identifiers returned by the backend
      for (const [tempId, realId] of Object.entries(identifiers)) {
        replaceNodeId(tempId, realId);
      }
      // Everything sent is now persisted — clear isNew flags, otherwise the
      // next save re-sends these nodes as new and the backend creates
      // DUPLICATE questions under fresh do_ ids.
      const cacheAfter = useTreeStore.getState().treeCache;
      const clearedCache: Record<string, Record<string, unknown>> = {};
      for (const [id, entry] of Object.entries(cacheAfter)) {
        if (entry?.isNew) {
          const { isNew: _cleared, ...rest } = entry;
          clearedCache[id] = rest;
        } else {
          clearedCache[id] = entry;
        }
      }
      useTreeStore.setState({ treeCache: clearedCache });
      setLastSaved(new Date().toISOString());
      setIsDirty(false);
    } catch (e) {
      console.error('[useSaveHierarchy] save failed:', e);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [config, isSaving, setIsDirty, setLastSaved]);

  return { save, isSaving, isDirty, lastSaved: useEditorStore.getState().lastSaved };
}
