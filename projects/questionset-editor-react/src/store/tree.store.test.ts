import { describe, it, expect, beforeEach } from 'vitest';
import { useTreeStore } from './tree.store';
import type { INode } from '../types/editor';

const QUESTION: INode = {
  id: 'do_q1',
  identifier: 'do_q1',
  name: 'Q1',
  isQuestion: true,
  objectType: 'Question',
  metadata: { name: 'Q1', body: '<p>old</p>' },
  children: [],
};

const ROOT: INode = {
  id: 'do_root',
  identifier: 'do_root',
  name: 'Root',
  isFolder: true,
  objectType: 'QuestionSet',
  metadata: { name: 'Root' },
  children: [QUESTION],
};

describe('hydrateNodeMeta', () => {
  beforeEach(() => {
    useTreeStore.setState({
      treeData: [structuredClone(ROOT)],
      treeCache: {},
      selectedNodeId: 'do_q1',
      activeNodeMeta: { name: 'Q1', body: '<p>old</p>' },
    });
  });

  it('merges into node.metadata without creating a treeCache entry', () => {
    useTreeStore.getState().hydrateNodeMeta('do_q1', { body: '<p>from-api</p>', qType: 'MCQ' });
    const state = useTreeStore.getState();
    const node = state.treeData[0]!.children![0]!;
    expect(node.metadata).toMatchObject({ body: '<p>from-api</p>', qType: 'MCQ' });
    // No cache entry — hydrated nodes must NOT be re-sent on the next save.
    expect(state.treeCache['do_q1']).toBeUndefined();
    expect(state.activeNodeMeta).toMatchObject({ body: '<p>from-api</p>' });
  });

  it('lets unsaved user edits (treeCache) win over hydrated values', () => {
    useTreeStore.setState({ treeCache: { do_q1: { body: '<p>user-edit</p>' } } });
    useTreeStore.getState().hydrateNodeMeta('do_q1', { body: '<p>from-api</p>', maxScore: 2 });
    const state = useTreeStore.getState();
    expect(state.activeNodeMeta['body']).toBe('<p>user-edit</p>');
    expect(state.activeNodeMeta['maxScore']).toBe(2);
  });

  it('does not touch activeNodeMeta for a non-selected node', () => {
    useTreeStore.setState({ selectedNodeId: 'do_root', activeNodeMeta: { name: 'Root' } });
    useTreeStore.getState().hydrateNodeMeta('do_q1', { body: '<p>from-api</p>' });
    expect(useTreeStore.getState().activeNodeMeta).toEqual({ name: 'Root' });
  });
});
