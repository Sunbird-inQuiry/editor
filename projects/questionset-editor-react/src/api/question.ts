import { apiClient } from './client';
import { URLS } from './urls';
import type { IQuestion, QuestionType, IOption, IMatchPair } from '../types/question';

// interactions — old editor format (type:'choice', options with label:{en})
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
  if (type === 'ftb') {
    return { response1: { type: 'text', validation: { required: 'Yes' } } };
  }
  return {};
}

// responseDeclaration — old editor format (mapping:[{value, score:null}])
function buildResponseDeclaration(
  type: QuestionType,
  options: IOption[],
  matchPairs: IMatchPair[],
): Record<string, unknown> {
  if (type === 'mcq') {
    const correctIdx = options.findIndex((o) => o.isCorrect);
    const idx = correctIdx >= 0 ? correctIdx : 0;
    return {
      response1: {
        cardinality: 'single',
        type: 'integer',
        correctResponse: { value: idx },
        mapping: [{ value: idx, score: null }],
      },
    };
  }
  if (type === 'mtf') {
    return {
      response1: {
        cardinality: 'multiple',
        type: 'map',
        correctResponse: { value: matchPairs.map((_, i) => `${i}`) },
      },
    };
  }
  return { response1: { cardinality: 'single', type: 'string', correctResponse: { value: '' } } };
}

function buildOutcomeDeclaration(maxScore = 1): Record<string, unknown> {
  return {
    maxScore: { cardinality: 'single', type: 'integer', defaultValue: maxScore },
  };
}

export interface CreateQuestionPayload {
  questionSetId: string;
  type: QuestionType;
  questionBody: string;
  options: IOption[];
  matchPairs: IMatchPair[];
  sequence: string[];
  solutionText: string;
  hints: Array<{ id: string; body: string }>;
  maxScore?: number;
  difficultyLevel?: string;
  bloomsLevel?: string;
  primaryCategory: string;
  channel: string;
  framework?: string;
  createdBy?: string;
}

export async function createQuestion(payload: CreateQuestionPayload): Promise<IQuestion> {
  const interactions = buildInteractions(payload.type, payload.options);
  const responseDeclaration = buildResponseDeclaration(payload.type, payload.options, payload.matchPairs);
  const outcomeDeclaration = buildOutcomeDeclaration(payload.maxScore ?? 1);

  // Build only fields with valid values — the v5 schema validator rejects
  // undefined / null / empty-array entries for optional properties.
  const question: Record<string, unknown> = {
    name: 'Question',
    mimeType: 'application/vnd.sunbird.question',
    objectType: 'Question',
    primaryCategory: payload.primaryCategory,
    questionType: payload.type,
    body: payload.questionBody,
    editorState: {
      question:   payload.questionBody,
      options:    payload.options,
      matchPairs: payload.matchPairs,
      sequence:   payload.sequence,
    },
    interactions,
    responseDeclaration,
    outcomeDeclaration,
  };

  if (payload.channel)    question.channel   = payload.channel;
  if (payload.framework)  question.framework  = payload.framework;
  if (payload.createdBy)  question.createdBy  = payload.createdBy;
  if (payload.difficultyLevel) question.difficultyLevel = payload.difficultyLevel;
  if (payload.bloomsLevel)     question.bloomsLevel     = payload.bloomsLevel;
  if (payload.solutionText) {
    question.solutions = [{ id: Math.random().toString(36).slice(2), type: 'html', value: payload.solutionText }];
  }
  if (payload.hints?.length) question.hints = payload.hints;

  const response = await apiClient.post(URLS.question.create, {
    request: { question },
  });

  return response.data?.result?.question ?? response.data?.result as IQuestion;
}

export async function readQuestion(questionId: string): Promise<IQuestion> {
  const response = await apiClient.get(`${URLS.question.read}/${questionId}`);
  return response.data?.result?.question as IQuestion;
}

export async function updateQuestion(
  questionId: string,
  payload: Partial<CreateQuestionPayload>,
): Promise<void> {
  const updates: Record<string, unknown> = {
    body: payload.questionBody,
    editorState: {
      question: payload.questionBody,
      options: payload.options,
      matchPairs: payload.matchPairs,
      sequence: payload.sequence,
    },
    // Old editor sends {} for empty solutions/hints, not undefined/array
    solutions: payload.solutionText
      ? { id: Math.random().toString(36).slice(2), type: 'html', value: payload.solutionText }
      : {},
    hints: {},
  };

  if (payload.difficultyLevel) updates.difficultyLevel = payload.difficultyLevel;
  if (payload.bloomsLevel)     updates.bloomsLevel     = payload.bloomsLevel;

  if (payload.options && payload.type) {
    updates['responseDeclaration'] = buildResponseDeclaration(payload.type, payload.options, payload.matchPairs ?? []);
    updates['interactions'] = buildInteractions(payload.type, payload.options);
  }

  await apiClient.patch(`${URLS.question.update}/${questionId}`, {
    request: { question: updates },
  });
}

export async function listQuestions(
  questionIds: string[],
): Promise<IQuestion[]> {
  if (questionIds.length === 0) return [];
  const response = await apiClient.post(URLS.question.list, {
    request: { search: { identifier: questionIds } },
  });
  return (response.data?.result?.questions ?? []) as IQuestion[];
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await apiClient.delete(`${URLS.question.retire}/${questionId}`);
}
