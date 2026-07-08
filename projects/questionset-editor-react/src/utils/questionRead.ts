import type { IQuestion, QuestionType, IOption, IMatchPair, IHint } from '../types/question';
import { resolveQuestionType, resolveByQType, resolveByCategory, resolveByInteractionType } from '../registry';
import { asI18nMap, readI18n } from './i18nField';
import type { I18nMap, I18nValue } from './i18nField';

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

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export function deriveQuestionType(raw: Record<string, unknown>): QuestionType | undefined {
  // New-editor questions carry questionType directly (not persisted by the
  // backend schema, but present in hierarchy-embedded metadata).
  const direct = raw['questionType'] as string | undefined;
  const directDef = resolveQuestionType(direct);
  if (directDef) return directDef.key;

  const byQType = resolveByQType(raw['qType'] as string | undefined);
  if (byQType) return byQType.key;

  const byCategory = resolveByCategory(raw['primaryCategory'] as string | undefined);
  if (byCategory) return byCategory.key;

  const interactionTypes = raw['interactionTypes'] as string[] | undefined;
  const byInteraction = resolveByInteractionType(interactionTypes?.[0]);
  if (byInteraction) return byInteraction.key;

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
        body: readI18n(value['body'] as I18nValue, 'en'),
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

/** Decode all per-language text sources for the store's i18n maps. */
function buildI18nSource(raw: Record<string, unknown>, editorState: Record<string, unknown>): IQuestion['i18nSource'] {
  const mapOf = (v: unknown): I18nMap | undefined =>
    v && typeof v === 'object' && !Array.isArray(v) ? asI18nMap(v as I18nValue) : undefined;

  // Solution: value is {lang: {type, value}} in the newer old-editor format.
  // Capture every language AND every type (html/video/audio) — the type
  // decides whether `value` is rendered text or a media asset id.
  let solutionByLang: Record<string, { type: string; value: string }> | undefined;
  const solutions = Array.isArray(raw['solutions']) && (raw['solutions'] as unknown[]).length
    ? raw['solutions'] : editorState['solutions'];
  if (Array.isArray(solutions) && solutions[0]) {
    const valueMap = asRecord(asRecord(solutions[0])['value']);
    const out: Record<string, { type: string; value: string }> = {};
    for (const [lang, v] of Object.entries(valueMap)) {
      const entry = asRecord(v);
      if (typeof entry['type'] === 'string' && typeof entry['value'] === 'string') {
        out[lang] = { type: entry['type'], value: entry['value'] };
      }
    }
    if (Object.keys(out).length) solutionByLang = out;
  }

  // Hint: the entry referenced by outcomeDeclaration.hint.defaultValue.
  let hint: I18nMap | undefined;
  const hintId = asRecord(asRecord(raw['outcomeDeclaration'])['hint'])['defaultValue'];
  const hintEntry = typeof hintId === 'string' ? asRecord(raw['hints'])[hintId] : undefined;
  if (hintEntry && typeof hintEntry === 'object') hint = asI18nMap(hintEntry as I18nValue);

  const rawOptions = Array.isArray(editorState['options']) ? (editorState['options'] as unknown[]) : [];
  const optionMaps = rawOptions.map((o) => mapOf(asRecord(asRecord(o)['value'])['body']) ?? {});

  const rawPairs = Array.isArray(editorState['pairs']) ? (editorState['pairs'] as unknown[]) : [];

  // SEQ labels in correctOrder order.
  let sequence: I18nMap[] | undefined;
  const correctOrder = editorState['correctOrder'];
  if (Array.isArray(correctOrder) && correctOrder.length && rawOptions.length) {
    const byValue = new Map(rawOptions.map((o) => [String(asRecord(o)['value']), asRecord(o)['label']]));
    sequence = correctOrder.map((v) => mapOf(byValue.get(String(v))) ?? {});
  }

  return {
    question: mapOf(editorState['question']),
    answer: mapOf(editorState['answer']),
    sentence: mapOf(editorState['sentence']),
    solutionByLang,
    hint,
    options: optionMaps.some((m) => Object.keys(m).length) ? optionMaps : undefined,
    pairsLeft: rawPairs.length ? rawPairs.map((p) => mapOf(asRecord(p)['left']) ?? {}) : undefined,
    pairsRight: rawPairs.length ? rawPairs.map((p) => mapOf(asRecord(p)['right']) ?? {}) : undefined,
    sequence,
  };
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
    body: typeof raw['body'] === 'string' ? raw['body'] : readI18n(raw['body'] as I18nValue, 'en') || undefined,
    editorState: {
      ...editorState,
      // Fields may be i18n maps — the store shows the en slot; other
      // languages are carried in i18nSource below.
      question: readI18n(editorState['question'] as I18nValue, 'en') || readI18n(raw['body'] as I18nValue, 'en'),
      answer: readI18n(editorState['answer'] as I18nValue, 'en') || undefined,
      sentence: readI18n(editorState['sentence'] as I18nValue, 'en') || undefined,
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
    i18nSource: buildI18nSource(raw, editorState),
  };
}
