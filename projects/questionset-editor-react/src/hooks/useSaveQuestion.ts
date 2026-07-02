/**
 * useSaveQuestion
 *
 * New questions (temp- identifier):
 *   Store the full question payload in the tree node and delegate creation
 *   to the hierarchy update API — exactly as the old Angular editor does.
 *   The hierarchy update creates the question, sets visibility:Parent, and
 *   returns the real identifier in `result.identifiers`.
 *
 * Existing questions (real identifier):
 *   Call PATCH /question/v2/update/{id} directly (unchanged behaviour).
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
// Build question metadata payload (shared between create-via-hierarchy and update)
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
    showHints, showSolutions,
    setIsDirty, setIsSaving,
  } = useQuestionStore();

  const config        = useEditorStore((s) => s.editorConfig);
  const { selectedNodeId, updateNode } = useTreeStore();
  const { save: saveHierarchy } = useSaveHierarchy();

  const save = useCallback(async () => {
    if (!questionType || !selectedNodeId) return;

    const channel    = config?.context?.channel    ?? '';
    const createdBy  = config?.context?.userId     ?? '';
    const framework  = config?.context?.framework  ?? '';
    const primaryCategory = PRIMARY_CATEGORY_MAP[questionType] ?? 'Multiple Choice Question';

    const interactions       = buildInteractions(questionType, options);
    const responseDeclaration = buildResponseDeclaration(questionType, options, matchPairs);
    const outcomeDeclaration  = {
      maxScore: { cardinality: 'single', type: 'integer', defaultValue: maxScore ?? 1 },
    };

    const questionName = (questionBody || '').replace(/<[^>]+>/g, '').slice(0, 60).trim() || 'Question';

    setIsSaving(true);
    try {
      const isExisting = activeQuestion?.identifier && !activeQuestion.identifier.startsWith('temp-');

      if (isExisting) {
        // ── Existing question: PATCH via question update API ────────────────
        await updateQuestion(activeQuestion!.identifier!, {
          type: questionType,
          questionBody, options, matchPairs, sequence,
          solutionText, hints, primaryCategory,
          channel, framework, createdBy,
          difficultyLevel, bloomsLevel, maxScore,
        });
        updateNode(selectedNodeId, { name: questionName });
        toast.success('Question saved');
      } else {
        // ── New question: store full metadata in tree, create via hierarchy ──
        // The hierarchy update API creates the question with visibility:Parent
        // and returns its real identifier in result.identifiers.
        updateNode(selectedNodeId, {
          name: questionName,
          // Question content
          body:             questionBody,
          editorState: {
            question:   questionBody,
            options,
            matchPairs,
            sequence,
          },
          interactions,
          responseDeclaration,
          outcomeDeclaration,
          solutions: solutionText
            ? [{ id: Math.random().toString(36).slice(2), type: 'html', value: solutionText }]
            : [],
          hints,
          // Metadata
          primaryCategory,
          channel,
          framework,
          createdBy,
          difficultyLevel,
          bloomsLevel,
          showHints:    showHints    ?? false,
          showSolutions: showSolutions ?? false,
        });

        // Delegate creation + hierarchy persistence in one call
        await saveHierarchy();
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
    config, selectedNodeId, updateNode, saveHierarchy,
    setIsDirty, setIsSaving,
  ]);

  return { save };
}
