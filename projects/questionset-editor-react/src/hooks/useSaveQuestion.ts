/**
 * useSaveQuestion
 *
 * New questions (temp- identifier):
 *   POST /question/v2/create  (without visibility:Parent — v5 API rejects it)
 *   After creation, update the temp node with the real identifier so the
 *   next hierarchy save associates the question with its parent section.
 *
 * Existing questions (real identifier):
 *   PATCH /question/v2/update/{id}
 */
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useQuestionStore } from '../store/question.store';
import { useEditorStore } from '../store/editor.store';
import { useTreeStore } from '../store/tree.store';
import { createQuestion, updateQuestion } from '../api/question';
import { PRIMARY_CATEGORY_MAP } from '../types/question';

export function useSaveQuestion() {
  const {
    activeQuestion, questionType, questionBody, options, matchPairs, sequence,
    hints, solutionText, difficultyLevel, bloomsLevel, maxScore,
    showHints, showSolutions,
    setIsDirty, setIsSaving,
  } = useQuestionStore();

  const config                        = useEditorStore((s) => s.editorConfig);
  const { selectedNodeId, updateNode } = useTreeStore();

  const save = useCallback(async () => {
    if (!questionType || !selectedNodeId) return;

    const channel        = config?.context?.channel    ?? '';
    const createdBy      = config?.context?.userId     ?? '';
    const framework      = config?.context?.framework  ?? '';
    const primaryCategory = PRIMARY_CATEGORY_MAP[questionType] ?? 'Multiple Choice Question';

    const questionName = (questionBody || '')
      .replace(/<[^>]+>/g, '').slice(0, 60).trim() || 'Question';

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
      difficultyLevel,
      bloomsLevel,
      maxScore,
      showHints:     showHints    ?? false,
      showSolutions: showSolutions ?? false,
    };

    setIsSaving(true);
    try {
      const isExisting =
        activeQuestion?.identifier && !activeQuestion.identifier.startsWith('temp-');

      if (isExisting) {
        await updateQuestion(activeQuestion!.identifier!, payload);
        updateNode(selectedNodeId, { name: questionName });
        toast.success('Question saved');
      } else {
        const created = await createQuestion(payload);
        // Replace temp- node with the real identifier — the next hierarchy
        // save will associate this question with its parent section.
        updateNode(selectedNodeId, {
          identifier: created.identifier,
          id:         created.identifier,
          name:       questionName,
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
  }, [
    activeQuestion, questionType, questionBody, options, matchPairs, sequence,
    solutionText, hints, difficultyLevel, bloomsLevel, maxScore,
    showHints, showSolutions,
    config, selectedNodeId, updateNode,
    setIsDirty, setIsSaving,
  ]);

  return { save };
}
