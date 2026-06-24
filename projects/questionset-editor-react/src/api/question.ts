import { apiClient } from './client';
import type { IQuestion, QuestionType, IOption, IMatchPair } from '../types/question';

function buildInteractions(type: QuestionType, options: IOption[]): Record<string, unknown> {
  if (type === 'mcq' || type === 'msq') {
    return {
      response1: {
        type: { number: { min: 0, max: options.length } },
        validation: { required: true },
      },
    };
  }
  if (type === 'ftb') {
    return {
      response1: { type: 'string', validation: { required: true } },
    };
  }
  return {};
}

function buildResponseDeclaration(
  type: QuestionType,
  options: IOption[],
  matchPairs: IMatchPair[],
): Record<string, unknown> {
  if (type === 'mcq') {
    const correctIdx = options.findIndex((o) => o.isCorrect);
    return {
      response1: {
        cardinality: 'single',
        type: 'integer',
        correctResponse: { value: correctIdx >= 0 ? correctIdx : 0 },
        mapping: options.map((o, i) => ({ response: i, outcomes: { score: o.isCorrect ? 1 : 0 } })),
      },
    };
  }
  if (type === 'msq') {
    const correctIdxs = options.reduce<number[]>((acc, o, i) => (o.isCorrect ? [...acc, i] : acc), []);
    return {
      response1: {
        cardinality: 'multiple',
        type: 'integer',
        correctResponse: { value: correctIdxs },
      },
    };
  }
  if (type === 'mtf') {
    return {
      response1: {
        cardinality: 'multiple',
        type: 'map',
        correctResponse: {
          value: matchPairs.map((_, i) => `${i}`),
        },
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

  const response = await apiClient.post('/action/question/v1/create', {
    request: {
      question: {
        name: 'Question',
        mimeType: 'application/vnd.sunbird.question',
        objectType: 'Question',
        primaryCategory: payload.primaryCategory,
        questionType: payload.type,
        body: payload.questionBody,
        editorState: {
          question: payload.questionBody,
          options: payload.options,
          matchPairs: payload.matchPairs,
          sequence: payload.sequence,
        },
        interactions,
        responseDeclaration,
        outcomeDeclaration,
        solutions: payload.solutionText
          ? [{ id: Math.random().toString(36).slice(2), type: 'html', value: payload.solutionText }]
          : [],
        hints: payload.hints,
        channel: payload.channel,
        framework: payload.framework,
        createdBy: payload.createdBy,
        difficultyLevel: payload.difficultyLevel,
        bloomsLevel: payload.bloomsLevel,
        visibility: 'Parent',
      },
    },
  });

  return response.data?.result?.question ?? response.data?.result as IQuestion;
}

export async function readQuestion(questionId: string): Promise<IQuestion> {
  const response = await apiClient.get(`/action/question/v1/read/${questionId}`);
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
    solutions: payload.solutionText
      ? [{ id: Math.random().toString(36).slice(2), type: 'html', value: payload.solutionText }]
      : undefined,
    hints: payload.hints,
    difficultyLevel: payload.difficultyLevel,
    bloomsLevel: payload.bloomsLevel,
  };

  if (payload.options && payload.type) {
    updates['responseDeclaration'] = buildResponseDeclaration(payload.type, payload.options, payload.matchPairs ?? []);
    updates['interactions'] = buildInteractions(payload.type, payload.options);
  }

  await apiClient.patch(`/action/question/v1/update/${questionId}`, {
    request: { question: updates },
  });
}

export async function listQuestions(
  questionIds: string[],
): Promise<IQuestion[]> {
  if (questionIds.length === 0) return [];
  const response = await apiClient.post('/action/question/v1/list', {
    request: { search: { identifier: questionIds } },
  });
  return (response.data?.result?.questions ?? []) as IQuestion[];
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await apiClient.delete(`/action/question/v1/retire/${questionId}`);
}
