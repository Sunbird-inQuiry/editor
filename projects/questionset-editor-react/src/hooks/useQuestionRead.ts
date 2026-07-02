import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { readQuestion } from '../api/question';
import { useEditorStore } from '../store/editor.store';
import { useTreeStore } from '../store/tree.store';
import { useQuestionStore } from '../store/question.store';
import { normalizeQuestionRead } from '../utils/questionRead';

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

  // temp- questions only exist client-side; nothing to read yet.
  const enabled = !!selectedNodeId && isQuestion && !selectedNodeId.startsWith('temp-');

  const query = useQuery({
    queryKey: ['question-read', selectedNodeId, editorMode],
    queryFn: () => readQuestion(selectedNodeId!, extraFields),
    enabled,
  });

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
