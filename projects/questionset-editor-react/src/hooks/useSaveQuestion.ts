/**
 * useSaveQuestion — creates/updates questions via hierarchy update,
 * matching the old Angular editor exactly.
 *
 * New questions:
 *  1. Generate a proper UUID (replaces temp- node)
 *  2. Build full metadata in old-editor format
 *  3. Store in tree node → saveHierarchy() creates it
 *
 * Existing questions: PATCH /question/v2/update/{id}
 */
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useQuestionStore } from '../store/question.store';
import { useEditorStore } from '../store/editor.store';
import { useTreeStore } from '../store/tree.store';
// updateQuestion (direct PATCH) no longer used — old editor creates/updates
// via hierarchy update for consistent full-metadata delivery.
import { useSaveHierarchy } from './useSaveHierarchy';
import { PRIMARY_CATEGORY_MAP } from '../types/question';
import type { QuestionType, IOption } from '../types/question';

// ---------------------------------------------------------------------------
// UUID generator
// ---------------------------------------------------------------------------
function genUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ---------------------------------------------------------------------------
// qType map  (old editor uses qType, not questionType)
// ---------------------------------------------------------------------------
const Q_TYPE: Record<QuestionType, string> = {
  mcq: 'MCQ', sa: 'SA', ftb: 'FTB', mtf: 'MTF', seq: 'SEQ', reo: 'REO',
};

// ---------------------------------------------------------------------------
// body HTML — old editor wraps question in specific template divs
// ---------------------------------------------------------------------------
function buildBodyHtml(type: QuestionType, questionHtml: string): string {
  if (type === 'mcq') {
    return `<div class='question-body' tabindex='-1'><div class='mcq-title' tabindex='0'>${questionHtml}</div><div data-choice-interaction='response1' class='mcq-vertical'></div></div>`;
  }
  return questionHtml;
}

// ---------------------------------------------------------------------------
// interactions — old editor format
// ---------------------------------------------------------------------------
function buildInteractions(type: QuestionType, options: IOption[]): Record<string, unknown> {
  if (type === 'mcq') {
    return {
      response1: {
        type: 'choice',
        options: options.map((o, i) => ({ label: { en: o.body }, value: i, hint: '' })),
        validation: { required: 'Yes' },
      },
    };
  }
  if (type === 'ftb') return { response1: { type: 'text', validation: { required: 'Yes' } } };
  return {};
}

// ---------------------------------------------------------------------------
// responseDeclaration — old editor format
// ---------------------------------------------------------------------------
function buildResponseDeclaration(type: QuestionType, options: IOption[]): Record<string, unknown> {
  if (type === 'mcq') {
    const correctIdx = options.findIndex(o => o.isCorrect);
    const idx = correctIdx >= 0 ? correctIdx : 0;
    return {
      response1: {
        cardinality: 'single', type: 'integer',
        correctResponse: { value: idx },
        mapping: [{ value: idx, score: null }],
      },
    };
  }
  return { response1: { cardinality: 'single', type: 'string', correctResponse: { value: '' } } };
}

// ---------------------------------------------------------------------------
// editorState — old editor format
// ---------------------------------------------------------------------------
function buildEditorState(type: QuestionType, questionBody: string, options: IOption[]) {
  if (type === 'mcq') {
    return {
      options: options.map((o, i) => ({ answer: !!o.isCorrect, value: { body: o.body, value: i } })),
      question: questionBody,
    };
  }
  return { question: questionBody };
}

// ---------------------------------------------------------------------------
// answer HTML — correct option in old editor's answer container
// ---------------------------------------------------------------------------
function buildAnswerHtml(type: QuestionType, options: IOption[]): string {
  if (type === 'mcq') {
    const correct = options.find(o => o.isCorrect);
    return `<div class='answer-container'><div class='answer-body'>${correct?.body ?? ''}</div></div>`;
  }
  return '';
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

  const config                                          = useEditorStore((s) => s.editorConfig);
  const { selectedNodeId, updateNode, replaceNodeId, treeData } = useTreeStore();
  const { save: saveHierarchy }                         = useSaveHierarchy();

  const save = useCallback(async () => {
    if (!questionType || !selectedNodeId) return;

    const channel         = config?.context?.channel   ?? '';
    const createdBy       = config?.context?.userId    ?? '';
    const framework       = config?.context?.framework ?? '';
    const primaryCategory = PRIMARY_CATEGORY_MAP[questionType] ?? 'Multiple Choice Question';

    const questionName = (questionBody || '').replace(/<[^>]+>/g, '').slice(0, 60).trim()
      || 'Untitled Question';

    // Taxonomy copied from root questionset — old editor includes these on every question
    const rootMeta = (treeData[0]?.metadata ?? {}) as Record<string, unknown>;
    const taxonomy: Record<string, unknown> = {};
    (['audience', 'board', 'medium', 'gradeLevel', 'subject', 'license'] as const)
      .forEach(k => { if (rootMeta[k]) taxonomy[k] = rootMeta[k]; });

    setIsSaving(true);
    try {
      const isExisting = activeQuestion?.identifier && !activeQuestion.identifier.startsWith('temp-');

      if (isExisting) {
        // ── Update existing question via hierarchy update ───────────────────
        // Old editor always sends full metadata in nodesModified for both new
        // and modified questions — same field set, isNew:false for existing.
        const questionMeta: Record<string, unknown> = {
          mimeType:    'application/vnd.sunbird.question',
          media:       [],
          editorState: buildEditorState(questionType, questionBody, options),
          body:        buildBodyHtml(questionType, questionBody),
          answer:      buildAnswerHtml(questionType, options),
          name:        questionName,
          qType:       Q_TYPE[questionType] ?? 'MCQ',
          primaryCategory,
          interactionTypes: questionType === 'mcq' ? ['choice'] : [],
          interactions:     buildInteractions(questionType, options),
          responseDeclaration: buildResponseDeclaration(questionType, options),
          outcomeDeclaration: {
            maxScore: { cardinality: 'single', type: 'integer', defaultValue: maxScore ?? 1 },
          },
          hints:     {},
          solutions: {},
          createdBy,
          channel,
          framework,
          ...taxonomy,
          ...(difficultyLevel ? { difficultyLevel } : {}),
          ...(bloomsLevel     ? { bloomsLevel }     : {}),
        };

        updateNode(selectedNodeId, { name: questionName, ...questionMeta });
        await saveHierarchy();
        toast.success('Question saved');
      } else {
        // ── New question — build UUID + full metadata, create via hierarchy ──
        const questionUuid = genUuid();

        const questionMeta: Record<string, unknown> = {
          mimeType:    'application/vnd.sunbird.question',
          media:       [],
          editorState: buildEditorState(questionType, questionBody, options),
          body:        buildBodyHtml(questionType, questionBody),
          answer:      buildAnswerHtml(questionType, options),
          name:        questionName,
          qType:       Q_TYPE[questionType] ?? 'MCQ',
          primaryCategory,
          interactionTypes: questionType === 'mcq' ? ['choice'] : [],
          interactions:     buildInteractions(questionType, options),
          responseDeclaration: buildResponseDeclaration(questionType, options),
          outcomeDeclaration: {
            maxScore: { cardinality: 'single', type: 'integer', defaultValue: maxScore ?? 1 },
          },
          hints:     {},
          solutions: {},
          createdBy,
          channel,
          framework,
          ...taxonomy,
          ...(difficultyLevel ? { difficultyLevel } : {}),
          ...(bloomsLevel     ? { bloomsLevel }     : {}),
        };

        // Replace temp- node with UUID, store full metadata, trigger hierarchy save
        replaceNodeId(selectedNodeId, questionUuid);
        updateNode(questionUuid, { name: questionName, ...questionMeta });
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
    config, selectedNodeId, updateNode, replaceNodeId, treeData, saveHierarchy,
    setIsDirty, setIsSaving,
  ]);

  return { save };
}
