import { create } from 'zustand';
import type { INode } from '../types/editor';
import { useEditorStore } from './editor.store';
import { detectNodeKind } from '../utils/nodeKind';
import { useQuestionStore } from './question.store';
import type { QuestionType } from '../types/question';

interface TreeState {
  treeData: INode[];
  selectedNodeId: string | null;
  treeCache: Record<string, Record<string, unknown>>;
  breadcrumb: Array<{ id: string; name: string }>;
  activeNodeMeta: Record<string, unknown>;
  setTreeData: (nodes: INode[]) => void;
  selectNode: (id: string) => void;
  updateNode: (id: string, patch: Record<string, unknown>) => void;
  addNode: (parentId: string, type: 'section' | 'question', questionType?: string) => string;
  /** Link an existing Live question (from the library) into a section —
   *  returns its id, 'exists' if already in the set, '' on depth limit. */
  addExistingQuestion: (
    parentId: string,
    item: { identifier: string; name?: string; questionType?: string } & Record<string, unknown>,
  ) => string;
  deleteNode: (id: string) => void;
  reorderChildren: (parentId: string, fromIndex: number, toIndex: number) => void;
  markDirty: () => void;
  getNodeById: (id: string) => INode | undefined;
  getChildrenOf: (id: string) => INode[];
  getBreadcrumb: (id: string) => Array<{ id: string; name: string }>;
  /** Merge extra fields into a node's metadata WITHOUT marking the set dirty.
   *  Used to hydrate fields (e.g. instructions) from a secondary API response. */
  mergeNodeMeta: (id: string, patch: Record<string, unknown>) => void;
  /** Merge server data into a node's metadata ONLY (no treeCache entry, no
   *  dirty flag) — hydrated nodes must not be re-sent in the next hierarchy
   *  save. User edits in treeCache always win over hydrated values. */
  hydrateNodeMeta: (id: string, patch: Record<string, unknown>) => void;
  /** Replace a temp- identifier with the real one returned by hierarchy update. */
  replaceNodeId: (tempId: string, realId: string) => void;
}

function bfsFind(nodes: INode[], id: string): INode | undefined {
  const queue: INode[] = [...nodes];
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node.id === id) return node;
    if (node.children) queue.push(...node.children);
  }
  return undefined;
}

function getNodeDepth(nodes: INode[], targetId: string, depth = 0): number {
  for (const n of nodes) {
    if (n.id === targetId) return depth;
    if (n.children?.length) {
      const found = getNodeDepth(n.children, targetId, depth + 1);
      if (found >= 0) return found;
    }
  }
  return -1;
}

function deepMergeNode(nodes: INode[], id: string, patch: Record<string, unknown>): INode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      const explicitMetaPatch = (patch['metadata'] as Record<string, unknown>) ?? {};
      return { ...node, ...patch, metadata: { ...(node.metadata ?? {}), ...explicitMetaPatch } };
    }
    if (node.children?.length) {
      return { ...node, children: deepMergeNode(node.children, id, patch) };
    }
    return node;
  });
}

function insertIntoParent(nodes: INode[], parentId: string, newNode: INode): INode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children ?? []), newNode] };
    }
    if (node.children?.length) {
      return { ...node, children: insertIntoParent(node.children, parentId, newNode) };
    }
    return node;
  });
}

function removeNode(nodes: INode[], id: string): INode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => ({ ...node, children: node.children ? removeNode(node.children, id) : [] }));
}

function reorderInParent(nodes: INode[], parentId: string, from: number, to: number): INode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      const children = [...(node.children ?? [])];
      const [moved] = children.splice(from, 1);
      children.splice(to, 0, moved);
      return { ...node, children };
    }
    if (node.children?.length) {
      return { ...node, children: reorderInParent(node.children, parentId, from, to) };
    }
    return node;
  });
}

function buildBreadcrumb(nodes: INode[], id: string): Array<{ id: string; name: string }> {
  const node = bfsFind(nodes, id);
  if (!node) return [];
  const crumbs: Array<{ id: string; name: string }> = [];
  let current: INode | undefined = node;
  while (current) {
    crumbs.unshift({ id: current.id, name: current.name });
    current = current.parent ? bfsFind(nodes, current.parent) : undefined;
  }
  return crumbs;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  treeData: [],
  selectedNodeId: null,
  treeCache: {},
  breadcrumb: [],
  activeNodeMeta: {},

  setTreeData: (nodes) => {
    const firstId = nodes[0]?.id ?? null;
    set({ treeData: nodes, selectedNodeId: firstId });
    if (firstId) {
      setTimeout(() => get().selectNode(firstId), 0);
    }
  },

  selectNode: (id) => {
    const { treeData, treeCache, getBreadcrumb } = get();
    const node = bfsFind(treeData, id);
    const breadcrumb = getBreadcrumb(id);
    const activeNodeMeta = { ...(node?.metadata ?? {}), ...(treeCache[id] ?? {}) };

    const kind = node ? detectNodeKind(node) : 'root';
    useEditorStore.getState().setNodeFlags({
      isFolder: kind === 'section',
      isRoot:   kind === 'root',
      isQuestion: kind === 'question',
    });

    // Sync question store when a question node is selected so the editor
    // knows the type. MUST be synchronous — the previous dynamic import
    // resolved after the question/v2/read hydration and clobbered the fully
    // hydrated store with this partial snapshot.
    if (kind === 'question' && node) {
      const qType = (node.questionType ?? node.metadata?.questionType) as QuestionType | undefined;
      useQuestionStore.getState().setActiveQuestion(
        qType
          ? {
              identifier: node.id,
              name: node.name,
              objectType: 'Question',
              primaryCategory: node.primaryCategory ?? '',
              mimeType: 'application/vnd.sunbird.question',
              questionType: qType,
              body: (node.metadata?.body as string) ?? '',
              editorState: (node.metadata?.editorState as Record<string, unknown>) ?? {},
              options: (node.metadata?.options as []) ?? undefined,
            }
          : null,
      );
    }

    set({ selectedNodeId: id, breadcrumb, activeNodeMeta });
  },

  updateNode: (id, patch) => {
    set((state) => {
      const nextCache = { ...state.treeCache, [id]: { ...(state.treeCache[id] ?? {}), ...patch } };
      const nextTree  = deepMergeNode(state.treeData, id, patch);
      // Keep activeNodeMeta in sync so tab-switches don't reset unsaved edits.
      const nextMeta  = state.selectedNodeId === id
        ? { ...state.activeNodeMeta, ...patch }
        : state.activeNodeMeta;
      return { treeData: nextTree, treeCache: nextCache, activeNodeMeta: nextMeta };
    });
    useEditorStore.getState().setIsDirty(true);
  },

  mergeNodeMeta: (id, patch) => {
    set((state) => {
      const nextCache  = { ...state.treeCache, [id]: { ...(state.treeCache[id] ?? {}), ...patch } };
      const nextTree   = deepMergeNode(state.treeData, id, patch);
      // If this node is currently selected, also refresh activeNodeMeta so
      // the form receives the new values without requiring a re-selection.
      const nextMeta   = state.selectedNodeId === id
        ? { ...state.activeNodeMeta, ...patch }
        : state.activeNodeMeta;
      return { treeData: nextTree, treeCache: nextCache, activeNodeMeta: nextMeta };
    });
    // Does NOT call setIsDirty — this is a read-only hydration, not a user edit.
  },

  hydrateNodeMeta: (id, patch) => {
    set((state) => {
      const nextTree = deepMergeNode(state.treeData, id, { metadata: patch });
      // treeCache holds unsaved user edits — they take precedence over the
      // freshly-read server values in the active form.
      const nextMeta = state.selectedNodeId === id
        ? { ...state.activeNodeMeta, ...patch, ...(state.treeCache[id] ?? {}) }
        : state.activeNodeMeta;
      return { treeData: nextTree, activeNodeMeta: nextMeta };
    });
  },

  addNode: (parentId, type, questionType) => {
    const state = get();
    const maxDepth = useEditorStore.getState().editorConfig?.config?.maxDepth ?? 3;
    const parentDepth = getNodeDepth(state.treeData, parentId);

    if (parentDepth >= maxDepth - 1) {
      console.warn(`[tree.store] addNode: depth would exceed maxDepth (${maxDepth})`);
      return '';
    }

    const newId = 'temp-' + Math.random().toString(36).slice(2);
    const isSection = type === 'section';
    const rootPrimaryCategory =
      useEditorStore.getState().editorConfig?.config?.primaryCategory ?? 'Practice Question Set';

    const newNode: INode = {
      id: newId,
      identifier: newId,
      name: isSection ? 'Untitled Section' : 'Untitled Question',
      isFolder: isSection,
      isQuestion: !isSection,
      questionType: questionType,
      children: [],
      parent: parentId,
      metadata: {
        mimeType: isSection
          ? 'application/vnd.sunbird.questionset'
          : 'application/vnd.sunbird.question',
        objectType: isSection ? 'QuestionSet' : 'Question',
        primaryCategory: isSection ? rootPrimaryCategory : 'Multiple Choice Question',
        questionType,
        code: newId,
        // Questions get NO default title — it must be authored in Details.
        ...(isSection ? { name: 'Untitled Section' } : {}),
        visibility: 'Parent',
      },
    };

    set((state) => ({
      treeData: insertIntoParent(state.treeData, parentId, newNode),
      treeCache: { ...state.treeCache, [newId]: { ...newNode.metadata, isNew: true } },
    }));

    setTimeout(() => get().selectNode(newId), 0);
    return newId;
  },

  addExistingQuestion: (parentId, item) => {
    const state = get();
    // Old editor LINKS an existing Live question into the hierarchy — it is
    // NOT re-created: no treeCache entry, no isNew; save only lists it in
    // the section's children.
    if (bfsFind(state.treeData, item.identifier)) return 'exists';

    const maxDepth = useEditorStore.getState().editorConfig?.config?.maxDepth ?? 3;
    if (getNodeDepth(state.treeData, parentId) >= maxDepth - 1) return '';

    const node: INode = {
      id: item.identifier,
      identifier: item.identifier,
      name: item.name ?? 'Question',
      isFolder: false,
      isQuestion: true,
      questionType: item.questionType,
      children: [],
      parent: parentId,
      metadata: { ...item, objectType: 'Question' },
    };
    set((s) => ({ treeData: insertIntoParent(s.treeData, parentId, node) }));
    useEditorStore.getState().setIsDirty(true);
    setTimeout(() => get().selectNode(item.identifier), 0);
    return item.identifier;
  },

  deleteNode: (id) => {
    set((state) => ({
      treeData: removeNode(state.treeData, id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },

  reorderChildren: (parentId, fromIndex, toIndex) => {
    set((state) => ({ treeData: reorderInParent(state.treeData, parentId, fromIndex, toIndex) }));
  },

  markDirty: () => {
    useEditorStore.getState().setIsDirty(true);
  },

  getNodeById: (id) => bfsFind(get().treeData, id),

  getChildrenOf: (id) => {
    const node = bfsFind(get().treeData, id);
    return node?.children ?? [];
  },

  getBreadcrumb: (id) => buildBreadcrumb(get().treeData, id),

  replaceNodeId: (tempId, realId) => {
    set((state) => {
      // Replace the temp identifier with the real one throughout the tree,
      // cache, and active selection.
      function replaceInTree(nodes: INode[]): INode[] {
        return nodes.map(n => {
          let updated = n.id === tempId || n.identifier === tempId
            ? { ...n, id: realId, identifier: realId }
            : n;
          // Children reference their parent by id (breadcrumbs walk it) —
          // repoint them or the ancestor walk dead-ends after the first save.
          if (updated.parent === tempId) updated = { ...updated, parent: realId };
          return { ...updated, children: replaceInTree(updated.children ?? []) };
        });
      }
      const { [tempId]: cached, ...restCache } = state.treeCache;
      return {
        treeData: replaceInTree(state.treeData),
        treeCache: cached ? { ...restCache, [realId]: cached } : restCache,
        selectedNodeId: state.selectedNodeId === tempId ? realId : state.selectedNodeId,
        activeNodeMeta: state.selectedNodeId === tempId
          ? { ...state.activeNodeMeta, id: realId, identifier: realId }
          : state.activeNodeMeta,
      };
    });
  },
}));
