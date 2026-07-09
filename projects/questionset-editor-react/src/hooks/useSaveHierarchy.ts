import { useState, useCallback, useRef } from 'react';
import { useTreeStore } from '../store/tree.store';
import { useEditorStore } from '../store/editor.store';
import { updateHierarchy } from '../api/hierarchy';
import type { INode } from '../types/editor';
import { getContentId, getUserId } from '../utils/context';
import { notifyError, apiErrorMessage } from '../utils/notify';
import { label } from '../utils/labels';
import { v4 as genUuid } from 'uuid';


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
    'index', 'depth', 'status', 'versionKey', 'createdOn', 'lastUpdatedOn', 'lastStatusChangedOn','graphId'
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
          // New section — cached form edits win over creation-time metadata,
          // and name comes last from node.name (the rename target) so it
          // can't be overwritten by the stale 'Untitled Section' default.
          const { isNew: _, ...cacheEdits } = cached ?? {};
          metadata = {
            mimeType: 'application/vnd.sunbird.questionset',
            primaryCategory: rootPrimaryCategory,
            visibility: 'Parent',
            channel,
            ...cleanMetadata(node.metadata ?? {}),
            ...cleanMetadata(cacheEdits),
            // After the spreads — creation-time metadata still carries the
            // stale temp- code and 'Untitled Section' name.
            code: identifier,
            name: node.name,
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

  // Old editor computes the root outcomeDeclaration.maxScore before every
  // hierarchy save (getMaxScore). Scores live in the tree metadata (hydrated
  // from question reads / built by useSaveQuestion), so sum locally.
  const rootId = nodes[0]?.identifier;
  const rootEntry = rootId ? (nodesModified[rootId] as { metadata?: Record<string, unknown> } | undefined) : undefined;
  if (rootEntry?.metadata) {
    let total = 0;
    const sumScores = (node: INode) => {
      if (node.isQuestion && !node.identifier.startsWith('temp-')) {
        const meta = { ...(node.metadata ?? {}), ...(treeCache[node.identifier] ?? {}) };
        const od = meta.outcomeDeclaration as Record<string, Record<string, unknown>> | undefined;
        const score = Number(od?.maxScore?.defaultValue ?? meta.maxScore ?? 1);
        total += Number.isFinite(score) && score > 0 ? score : 1;
      }
      (node.children ?? []).forEach(sumScores);
    };
    nodes.forEach(sumScores);
    if (total > 0) {
      rootEntry.metadata.outcomeDeclaration = {
        ...((rootEntry.metadata.outcomeDeclaration as Record<string, unknown>) ?? {}),
        maxScore: { cardinality: 'single', type: 'integer', defaultValue: total },
      };
    }
  }
  return { nodesModified, hierarchy };
}

export function useSaveHierarchy() {
  const [isSaving, setIsSaving] = useState(false);
  // Call-time in-flight guard — closure state is stale until React re-renders,
  // so a double-click could send two hierarchy updates (duplicating isNew nodes).
  const inFlight = useRef(false);

  const isDirty = useEditorStore((s) => s.isDirty);
  const lastSaved = useEditorStore((s) => s.lastSaved);
  const { setIsDirty, setLastSaved } = useEditorStore();
  const config = useEditorStore((s) => s.editorConfig);

  const save = useCallback(async (): Promise<boolean> => {
    if (!config || inFlight.current) return false;
    const contentId = getContentId(config.context);
    if (!contentId) return false;

    const channel = config.context.channel ?? '';
    const lastUpdatedBy = getUserId(config.context);

    inFlight.current = true;
    setIsSaving(true);
    try {
      const rootPrimaryCategory = config.config.primaryCategory ?? 'Practice Question Set';
      // Read treeData + treeCache from the store at call-time, not from the
      // React closure — prevents stale data when saveHierarchy() is called
      // immediately after replaceNodeId() + updateNode() in useSaveQuestion.
      // Old editor keys NEW SECTIONS by a client uuid (code = uuid) — not the
      // internal temp- marker. Swap before building the payload; question
      // temp- nodes stay (they're excluded from the save until authored).
      const swapTempSectionIds = (nodes: INode[]) => {
        for (const n of nodes) {
          if (!n.isQuestion && n.identifier.startsWith('temp-')) {
            useTreeStore.getState().replaceNodeId(n.identifier, genUuid());
          }
          if (n.children) swapTempSectionIds(n.children);
        }
      };
      swapTempSectionIds(useTreeStore.getState().treeData);

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
      // The backend accepted this batch — it's now the rollback baseline.
      useTreeStore.getState().markSaved();
      setLastSaved(new Date().toISOString());
      setIsDirty(false);
      useEditorStore.getState().eventHandlers.onHierarchySaved?.({ identifiers });
      return true;
    } catch (e) {
      console.error('[useSaveHierarchy] save failed:', e);
      notifyError(apiErrorMessage(e, label('messages.error.001', 'Failed to save. Please try again.')));
      // nodesModified/hierarchy are rejected as a single transaction — none
      // of the pending nodes since the last successful save actually exist
      // on the backend. Discard them instead of leaving them in the tree
      // looking saved.
      useTreeStore.getState().revertToSaved();
      return false;
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
  }, [config, setIsDirty, setLastSaved]);

  return { save, isSaving, isDirty, lastSaved };
}
