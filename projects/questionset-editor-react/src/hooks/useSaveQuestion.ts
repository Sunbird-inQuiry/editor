import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useQuestionStore } from '../store/question.store';
import { useEditorStore } from '../store/editor.store';
import { useTreeStore } from '../store/tree.store';
import { createQuestion, updateQuestion } from '../api/question';
import { PRIMARY_CATEGORY_MAP } from '../types/question';

export function useSaveQuestion() {
  const { activeQuestion, questionType, questionBody, options, matchPairs, sequence, hints, solutionText, setIsDirty, setIsSaving } = useQuestionStore();
  const config = useEditorStore((s) => s.editorConfig);
  const { selectedNodeId, updateNode } = useTreeStore();

  const save = useCallback(async () => {
    if (!questionType || !selectedNodeId) return;

    const channel = config?.context?.channel ?? '';
    const createdBy = config?.context?.userId ?? '';
    const framework = config?.context?.framework ?? '';

    setIsSaving(true);
    try {
      const primaryCategory = PRIMARY_CATEGORY_MAP[questionType];
      const payload = {
        questionSetId: selectedNodeId,
        type: questionType,
        questionBody,
        options,
        matchPairs,
        sequence,
        solutionText,
        hints,
        primaryCategory,
        channel,
        framework,
        createdBy,
      };

      if (activeQuestion?.identifier && !activeQuestion.identifier.startsWith('temp-')) {
        await updateQuestion(activeQuestion.identifier, payload);
        updateNode(selectedNodeId, { name: questionBody.slice(0, 60) || 'Question' });
        toast.success('Question saved');
      } else {
        const created = await createQuestion(payload);
        updateNode(selectedNodeId, {
          identifier: created.identifier,
          name: questionBody.slice(0, 60) || 'Question',
        });
        toast.success('Question created');
      }
      setIsDirty(false);
    } catch (e) {
      console.error('[useSaveQuestion] save failed:', e);
      toast.error('Failed to save question. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [activeQuestion, questionType, questionBody, options, matchPairs, sequence, solutionText, hints, config, selectedNodeId, updateNode, setIsDirty, setIsSaving]);

  return { save };
}
