import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { readQuestion } from '../api/question';
import { useEditorStore } from '../store/editor.store';
import { useTreeStore } from '../store/tree.store';
import { useQuestionStore } from '../store/question.store';
import { normalizeQuestionRead } from '../utils/questionRead';
import { notifyError, apiErrorMessage } from '../utils/notify';
import { label } from '../utils/labels';

/**
 * Reads the selected question individually from `question/v2/read`, the way
 * the old Angular editor's question.component did on open. The hierarchy
 * response does NOT embed editorState/options/solutions/hints/media on a
 * real backend — without this read the editing panel would be empty.
 *
 * On success the response hydrates:
 *  - question.store (via normalizeQuestionRead → setActiveQuestion), unless
 *    the user already started editing (isDirty guard)
 *  - the tree node's metadata (hydrateNodeMeta — no treeCache entry, so the
 *    node is not re-sent on the next hierarchy save)
 */
export function useQuestionRead() {
  const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
  const isQuestion = useEditorStore((s) => s.isCurrentNodeQuestion);
  const editorMode = useEditorStore((s) => s.editorMode);
  const questionFormConfig = useEditorStore((s) => s.questionFormConfig);

  // Old editor appended the leaf-form field codes to readQuestionFields.
  const extraFields = useMemo(
    () => (questionFormConfig ?? []).map((f) => f.code).filter(Boolean),
    [questionFormConfig],
  );

  // A question is readable only once the backend has assigned its do_ id —
  // temp-/client-uuid ids exist purely client-side during creation.
  const enabled = !!selectedNodeId && isQuestion && selectedNodeId.startsWith('do_');

  const query = useQuery({
    // extraFields is part of the key — a cached read fetched before the
    // category definition resolved would be missing the leaf-form fields.
    queryKey: ['question-read', selectedNodeId, editorMode, extraFields.join(',')],
    queryFn: () => readQuestion(selectedNodeId!, extraFields),
    enabled,
    retry: 1,
  });

  // Read failed — surface the server error and fall back to the root node.
  useEffect(() => {
    if (!query.error || !enabled) return;
    notifyError(apiErrorMessage(query.error, label('messages.error.001', 'Failed to load the question.')));
    const rootId = useTreeStore.getState().treeData[0]?.id;
    if (rootId) useTreeStore.getState().selectNode(rootId);
  }, [query.error, enabled]);

  useEffect(() => {
    const raw = query.data;
    if (!raw || !selectedNodeId) return;
    // Stale response for a previously-selected question — ignore.
    if ((raw['identifier'] as string) !== selectedNodeId) return;

    useTreeStore.getState().hydrateNodeMeta(selectedNodeId, raw);

    // Don't clobber in-progress edits with the (older) server state.
    if (useQuestionStore.getState().isDirty) return;
    useQuestionStore.getState().setActiveQuestion(normalizeQuestionRead(raw));
  }, [query.data, selectedNodeId]);

  return { isFetching: query.isFetching, error: query.error };
}
