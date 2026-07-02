import type { IQuestion, QuestionType, IOption, IMatchPair, IHint } from '../types/question';
import { PRIMARY_CATEGORY_MAP, LEGACY_CATEGORY_MAP } from '../types/question';

/**
 * Normalizes a raw `question/v2/read` response into the shape the question
 * store expects, replicating how the old Angular editor's
 * question.component.ts `initialize()` populated its editing state:
 *
 * - editorState is the primary source (question/options/matchPairs/sequence)
 * - MCQ answer comes from responseDeclaration.response1.correctResponse.value
 * - solutions[0].{type,id,value}; maxScore from outcomeDeclaration
 * - qType / primaryCategory / interactionTypes drive the question type
 *
 * All raw fields are kept on the returned object for save round-trips
 * (media, interactions, responseDeclaration, templateId, flags, …).
 */

const QTYPE_REVERSE: Record<string, QuestionType> = {
  MCQ: 'mcq',
  SA: 'sa',
  VSA: 'sa',
  LA: 'sa',
  FTB: 'ftb',
  MTF: 'mtf',
  SEQ: 'seq',
  REO: 'reo',
};

const CATEGORY_REVERSE: Record<string, QuestionType> = {
  ...(Object.fromEntries(
    Object.entries(PRIMARY_CATEGORY_MAP).map(([k, v]) => [v, k as QuestionType]),
  ) as Record<string, QuestionType>),
  ...LEGACY_CATEGORY_MAP,
};

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function deriveQuestionType(raw: Record<string, unknown>): QuestionType | undefined {
  // New-editor questions carry questionType directly (not persisted by the
  // backend schema, but present in hierarchy-embedded metadata).
  const direct = raw['questionType'] as QuestionType | undefined;
  if (direct && direct in PRIMARY_CATEGORY_MAP) return direct;

  const qType = (raw['qType'] as string | undefined)?.toUpperCase();
  if (qType && QTYPE_REVERSE[qType]) return QTYPE_REVERSE[qType];

  const category = raw['primaryCategory'] as string | undefined;
  if (category && CATEGORY_REVERSE[category]) return CATEGORY_REVERSE[category];

  const interactionTypes = raw['interactionTypes'] as string[] | undefined;
  if (interactionTypes?.[0] === 'choice') return 'mcq';
  if (interactionTypes?.[0] === 'text') return 'ftb';

  // Old editor treated no interaction type as 'default' (non-interactive
  // question — VSA/SA/LA/etc.), which maps to the subjective editor here.
  if (raw['body'] || raw['editorState']) return 'sa';
  return undefined;
}

/** MCQ correct-answer index from responseDeclaration.response1.correctResponse.value */
function correctResponseIndex(raw: Record<string, unknown>): number | undefined {
  const response1 = asRecord(asRecord(raw['responseDeclaration'])['response1']);
  const value = asRecord(response1['correctResponse'])['value'];
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) return Number(value);
  return undefined;
}

/**
 * Options come in two shapes:
 * - old editor editorState: [{ answer: boolean, value: { body, value: idx } }]
 * - new editor / store:     [{ id, body, isCorrect }]
 */
export function normalizeOptions(
  rawOptions: unknown,
  correctIdx: number | undefined,
): IOption[] | undefined {
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) return undefined;

  return rawOptions.map((entry, index) => {
    const o = asRecord(entry);
    if ('value' in o && typeof o['value'] === 'object') {
      // old editor shape
      const value = asRecord(o['value']);
      const idx = typeof value['value'] === 'number' ? (value['value'] as number) : index;
      return {
        id: makeId(),
        body: (value['body'] as string) ?? '',
        value: idx,
        isCorrect: o['answer'] === true || (correctIdx !== undefined && idx === correctIdx),
      };
    }
    return {
      id: (o['id'] as string) ?? makeId(),
      body: (o['body'] as string) ?? '',
      isCorrect:
        o['isCorrect'] === true || (correctIdx !== undefined && index === correctIdx),
    };
  });
}

/** Old MTF editorState.pairs: [{left:{en}, right:{en}}] → store IMatchPair shape. */
function normalizePairs(rawPairs: unknown): IMatchPair[] | undefined {
  if (!Array.isArray(rawPairs) || rawPairs.length === 0) return undefined;
  return rawPairs.map((p, i) => {
    const r = asRecord(p);
    const side = (v: unknown) =>
      typeof v === 'string' ? v : ((asRecord(v)['en'] as string) ?? '');
    return { id: `pair-${i}-${makeId()}`, left: side(r['left']), right: side(r['right']) };
  });
}

/** Old SEQ editorState: {options:[{value:'A',label}], correctOrder:['A','B']} → labels in correct order. */
function normalizeSequence(editorState: Record<string, unknown>): string[] | undefined {
  const options = editorState['options'];
  const correctOrder = editorState['correctOrder'];
  if (!Array.isArray(options) || !Array.isArray(correctOrder) || correctOrder.length === 0) return undefined;
  const byValue = new Map(
    options.map((o) => {
      const r = asRecord(o);
      const label = r['label'];
      return [String(r['value']), typeof label === 'string' ? label : ((asRecord(label)['en'] as string) ?? '')];
    }),
  );
  return correctOrder.map((v) => byValue.get(String(v)) ?? '');
}

function normalizeHints(rawHints: unknown): IHint[] {
  if (Array.isArray(rawHints)) {
    return rawHints.map((h) => {
      const r = asRecord(h);
      return { id: (r['id'] as string) ?? makeId(), body: (r['body'] as string) ?? (r['value'] as string) ?? '' };
    });
  }
  // old editor stores hints as a uuid-keyed map with i18n values: {uuid: {en: text}}
  const map = asRecord(rawHints);
  return Object.entries(map).map(([id, v]) => ({
    id,
    body:
      typeof v === 'string'
        ? v
        : ((asRecord(v)['en'] as string) ?? (asRecord(v)['body'] as string) ?? (asRecord(v)['value'] as string) ?? ''),
  }));
}

function normalizeSolutions(raw: Record<string, unknown>): IQuestion['solutions'] {
  const editorState = asRecord(raw['editorState']);
  const source = Array.isArray(raw['solutions']) && (raw['solutions'] as unknown[]).length > 0
    ? raw['solutions']
    : editorState['solutions'];
  if (!Array.isArray(source)) return [];
  return source.map((s) => {
    const r = asRecord(s);
    // Newer old-editor format: value is a lang map {en: {type, value}} —
    // flatten to the en slot (multi-language authoring is a planned item).
    const valueMap = asRecord(r['value']);
    const en = asRecord(valueMap['en']);
    if (typeof en['type'] === 'string') {
      return {
        id: (r['id'] as string) ?? makeId(),
        type: en['type'] as string,
        value: (en['value'] as string) ?? '',
      };
    }
    return {
      id: (r['id'] as string) ?? makeId(),
      type: (r['type'] as string) ?? 'html',
      value: typeof r['value'] === 'string' ? r['value'] : '',
    };
  });
}

export function normalizeQuestionRead(raw: Record<string, unknown>): IQuestion {
  const editorState = asRecord(raw['editorState']);
  const correctIdx = correctResponseIndex(raw);
  const questionType = deriveQuestionType(raw);

  const options =
    normalizeOptions(editorState['options'], correctIdx) ??
    normalizeOptions(raw['options'], correctIdx);

  const outcomeDeclaration = asRecord(raw['outcomeDeclaration']);
  const maxScoreDefault = asRecord(outcomeDeclaration['maxScore'])['defaultValue'];
  const maxScore =
    typeof maxScoreDefault === 'number'
      ? maxScoreDefault
      : typeof raw['maxScore'] === 'number'
        ? (raw['maxScore'] as number)
        : undefined;

  return {
    ...(raw as Partial<IQuestion>),
    identifier: (raw['identifier'] as string) ?? '',
    name: (raw['name'] as string) ?? '',
    objectType: 'Question',
    primaryCategory: (raw['primaryCategory'] as string) ?? '',
    mimeType: 'application/vnd.sunbird.question',
    questionType,
    body: (raw['body'] as string) ?? undefined,
    editorState: {
      ...editorState,
      question: (editorState['question'] as string) ?? (raw['body'] as string) ?? '',
      matchPairs:
        (editorState['matchPairs'] as IMatchPair[]) ??
        normalizePairs(editorState['pairs']) ??
        undefined,
      sequence:
        (editorState['sequence'] as string[]) ??
        normalizeSequence(editorState) ??
        undefined,
    },
    options,
    hints: normalizeHints(raw['hints']),
    solutions: normalizeSolutions(raw),
    media: (raw['media'] as IQuestion['media']) ?? [],
    maxScore,
  };
}
