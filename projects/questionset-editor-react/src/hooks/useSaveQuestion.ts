/**
 * useSaveQuestion
 *
 * New questions (temp- identifier):
 *   Store question metadata in the tree node, then call saveHierarchy().
 *   The hierarchy update creates the question (nodesModified isNew:true)
 *   and returns the real identifier in result.identifiers.
 *   This matches the old Angular editor behaviour.
 *
 * Existing questions (real identifier):
 *   PATCH /question/v2/update/{id} directly.
 */
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useQuestionStore } from '../store/question.store';
import { useEditorStore } from '../store/editor.store';
import { useTreeStore } from '../store/tree.store';
import { updateQuestion } from '../api/question';
import { useSaveHierarchy } from './useSaveHierarchy';
import { PRIMARY_CATEGORY_MAP } from '../types/question';
import type { QuestionType, IOption, IMatchPair } from '../types/question';

// ---------------------------------------------------------------------------
// Builders (shared with question.ts)
// ---------------------------------------------------------------------------

function buildResponseDeclaration(
  type: QuestionType,
  options: IOption[],
  matchPairs: IMatchPair[],
): Record<string, unknown> {
  if (type === 'mcq') {
    const correctIdx = options.findIndex(o => o.isCorrect);
    return {
      response1: {
        cardinality: 'single', type: 'integer',
        correctResponse: { value: correctIdx >= 0 ? correctIdx : 0 },
        mapping: options.map((o, i) => ({ response: i, outcomes: { score: o.isCorrect ? 1 : 0 } })),
      },
    };
  }
  if (type === 'mtf') {
    return {
      response1: {
        cardinality: 'multiple', type: 'map',
        correctResponse: { value: matchPairs.map((_, i) => `${i}`) },
      },
    };
  }
  return { response1: { cardinality: 'single', type: 'string', correctResponse: { value: '' } } };
}

function buildInteractions(type: QuestionType, options: IOption[]): Record<string, unknown> {
  if (type === 'mcq') {
    return {
      response1: {
        type: { number: { min: 0, max: options.length } },
        validation: { required: true },
      },
    };
  }
  if (type === 'ftb') return { response1: { type: 'string', validation: { required: true } } };
  return {};
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSaveQuestion() {
  const {
    activeQuestion, questionType, questionBody, options, matchPairs, sequence,
    hints, solutionText, difficultyLevel, bloomsLevel, maxScore,
    setIsDirty, setIsSaving,
  } = useQuestionStore();

  const config                        = useEditorStore((s) => s.editorConfig);
  const { selectedNodeId, updateNode } = useTreeStore();
  const { save: saveHierarchy }        = useSaveHierarchy();

  const save = useCallback(async () => {
    if (!questionType || !selectedNodeId) return;

    const channel         = config?.context?.channel   ?? '';
    const createdBy       = config?.context?.userId    ?? '';
    const framework       = config?.context?.framework ?? '';
    const primaryCategory = PRIMARY_CATEGORY_MAP[questionType] ?? 'Multiple Choice Question';

    const questionName = (questionBody || '')
      .replace(/<[^>]+>/g, '').slice(0, 60).trim() || 'Question';

    const interactions        = buildInteractions(questionType, options);
    const responseDeclaration = buildResponseDeclaration(questionType, options, matchPairs);

    setIsSaving(true);
    try {
      const isExisting =
        activeQuestion?.identifier && !activeQuestion.identifier.startsWith('temp-');

      if (isExisting) {
        // ── Update existing question via PATCH API ──────────────────────────
        await updateQuestion(activeQuestion!.identifier!, {
          type: questionType,
          questionBody, options, matchPairs, sequence,
          solutionText, hints, primaryCategory,
          channel, framework, createdBy,
          difficultyLevel, bloomsLevel, maxScore,
        });
        updateNode(selectedNodeId, { name: questionName });
        toast.success('Question saved');
        setIsDirty(false);
      } else {
        // ── New question: embed metadata in the tree node, create via ───────
        //    hierarchy update (same as old Angular editor).
        //    buildSavePayload picks up node.metadata for isNew nodes.
        updateNode(selectedNodeId, {
          name: questionName,
          // Question content — picked up by cleanMetadata in buildSavePayload
          body:              questionBody,
          responseDeclaration,
          interactions,
          outcomeDeclaration: {
            maxScore: { cardinality: 'single', type: 'integer', defaultValue: maxScore ?? 1 },
          },
          editorState: {
            question: questionBody, options, matchPairs, sequence,
          },
          ...(solutionText ? {
            solutions: [{ id: Math.random().toString(36).slice(2), type: 'html', value: solutionText }],
          } : {}),
          ...(hints?.length ? { hints } : {}),
          ...(difficultyLevel ? { difficultyLevel } : {}),
          ...(bloomsLevel     ? { bloomsLevel }     : {}),
        });

        // hierarchy save creates the question + returns identifiers
        await saveHierarchy();
        toast.success('Question created');
      }
    } catch (e) {
      console.error('[useSaveQuestion] save failed:', e);
      toast.error('Failed to save question. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [
    activeQuestion, questionType, questionBody, options, matchPairs, sequence,
    solutionText, hints, difficultyLevel, bloomsLevel, maxScore,
    config, selectedNodeId, updateNode, saveHierarchy,
    setIsDirty, setIsSaving,
  ]);

  return { save };
}
