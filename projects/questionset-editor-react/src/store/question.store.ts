import { create } from 'zustand';
import type { IQuestion, QuestionType, IOption, IMatchPair, IHint } from '../types/question';
import type { I18nMap } from '../utils/i18nField';

export type SolutionType = '' | 'html' | 'video' | 'audio';

/** Per-field language maps — the plain string fields below always hold the
 *  ACTIVE language's text; other languages live here (old editor i18n). */
export interface II18nText {
  questionBody: I18nMap;
  answerText: I18nMap;
  sentence: I18nMap;
  solutionText: I18nMap;
  hintText: I18nMap;
  /** keyed by option/pair id; sequence positional */
  options: Record<string, I18nMap>;
  pairsLeft: Record<string, I18nMap>;
  pairsRight: Record<string, I18nMap>;
  sequence: I18nMap[];
}

const EMPTY_I18N: II18nText = {
  questionBody: {}, answerText: {}, sentence: {}, solutionText: {}, hintText: {},
  options: {}, pairsLeft: {}, pairsRight: {}, sequence: [],
};

export interface ISolutionAsset {
  id: string;
  src: string;
  name: string;
  thumbnail?: string;
}

interface QuestionState {
  activeQuestion: IQuestion | null;
  questionType: QuestionType | null;
  isDirty: boolean;
  isSaving: boolean;
  options: IOption[];
  matchPairs: IMatchPair[];
  sequence: string[];
  hints: IHint[];
  /** Question-level hint text — old editor stores it as hints[uuid] = {en} with
   *  the uuid referenced from outcomeDeclaration.hint.defaultValue. */
  hintText: string;
  /** Solution — old editor supports html (text+image), video and audio. */
  solutionType: SolutionType;
  solutionUUID: string;
  solutionAsset: ISolutionAsset | null;
  solutionText: string;
  /** Model answer for non-interactive questions (SA etc.) — old editorState.answer */
  answerText: string;
  /** REO: the correct sentence — old editorState.sentence */
  sentence: string;
  questionBody: string;
  /** Active content language (en/ar/fr/pt — old editor multilingual authoring). */
  contentLang: string;
  i18nText: II18nText;
  /** Snapshot current fields into contentLang, then load `lang`'s text. */
  switchContentLang: (lang: string) => void;
  /** i18nText with the current visible text merged into the active lang. */
  getI18nSnapshot: () => II18nText;
  // Question-level metadata (persisted on save)
  difficultyLevel: string;
  bloomsLevel: string;
  purpose: string;
  maxScore: number;
  expectedDuration: number;
  showHints: boolean;
  showSolutions: boolean;
  isPartialScore: boolean;
  evalUnordered: boolean;
  // Actions
  setActiveQuestion: (question: IQuestion | null) => void;
  setQuestionType: (type: QuestionType) => void;
  setQuestionBody: (body: string) => void;
  setOptions: (options: IOption[]) => void;
  updateOption: (id: string, patch: Partial<IOption>) => void;
  addOption: () => void;
  removeOption: (id: string) => void;
  setMatchPairs: (pairs: IMatchPair[]) => void;
  addMatchPair: () => void;
  removeMatchPair: (id: string) => void;
  updateMatchPair: (id: string, patch: Partial<IMatchPair>) => void;
  setSequence: (seq: string[]) => void;
  setHints: (hints: IHint[]) => void;
  setHintText: (text: string) => void;
  addHint: () => void;
  removeHint: (id: string) => void;
  updateHint: (id: string, body: string) => void;
  setSolutionText: (text: string) => void;
  setSolutionType: (type: SolutionType) => void;
  setSolutionAsset: (asset: ISolutionAsset | null) => void;
  clearSolution: () => void;
  setAnswerText: (text: string) => void;
  setSentence: (text: string) => void;
  setDifficultyLevel: (v: string) => void;
  setBloomsLevel: (v: string) => void;
  setPurpose: (v: string) => void;
  setMaxScore: (v: number) => void;
  setExpectedDuration: (v: number) => void;
  setShowHints: (v: boolean) => void;
  setShowSolutions: (v: boolean) => void;
  setIsPartialScore: (v: boolean) => void;
  setEvalUnordered: (v: boolean) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  resetQuestion: () => void;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

const DEFAULT_OPTIONS: IOption[] = [
  { id: makeId(), body: '', isCorrect: false },
  { id: makeId(), body: '', isCorrect: false },
];

const DEFAULT_META = {
  difficultyLevel: 'medium',
  bloomsLevel: 'understand',
  purpose: 'practice',
  maxScore: 1,
  expectedDuration: 60,
  showHints: true,
  showSolutions: true,
  // Old editor defaults for FTB scoring config
  isPartialScore: true,
  evalUnordered: true,
};

/** Merge the currently-visible field text into the active language's slots. */
function mergeSnapshot(s: QuestionState): II18nText {
  const put = (map: I18nMap | undefined, val: string): I18nMap => ({ ...(map ?? {}), [s.contentLang]: val });
  const options: Record<string, I18nMap> = { ...s.i18nText.options };
  s.options.forEach((o) => { options[o.id] = put(options[o.id], o.body); });
  const pairsLeft: Record<string, I18nMap> = { ...s.i18nText.pairsLeft };
  const pairsRight: Record<string, I18nMap> = { ...s.i18nText.pairsRight };
  s.matchPairs.forEach((p) => {
    pairsLeft[p.id] = put(pairsLeft[p.id], p.left);
    pairsRight[p.id] = put(pairsRight[p.id], p.right);
  });
  return {
    questionBody: put(s.i18nText.questionBody, s.questionBody),
    answerText: put(s.i18nText.answerText, s.answerText),
    sentence: put(s.i18nText.sentence, s.sentence),
    solutionText: put(s.i18nText.solutionText, s.solutionText),
    hintText: put(s.i18nText.hintText, s.hintText),
    options,
    pairsLeft,
    pairsRight,
    sequence: s.sequence.map((v, i) => put(s.i18nText.sequence[i], v)),
  };
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  activeQuestion: null,
  questionType: null,
  isDirty: false,
  isSaving: false,
  options: DEFAULT_OPTIONS,
  matchPairs: [],
  sequence: [],
  hints: [],
  hintText: '',
  solutionType: '' as SolutionType,
  solutionUUID: '',
  solutionAsset: null,
  solutionText: '',
  answerText: '',
  sentence: '',
  questionBody: '',
  contentLang: 'en',
  i18nText: EMPTY_I18N,
  ...DEFAULT_META,

  switchContentLang: (lang) => {
    const s = get();
    if (lang === s.contentLang) return;
    const t = mergeSnapshot(s);
    set({
      contentLang: lang,
      i18nText: t,
      questionBody: t.questionBody[lang] ?? '',
      answerText: t.answerText[lang] ?? '',
      sentence: t.sentence[lang] ?? '',
      solutionText: t.solutionText[lang] ?? '',
      hintText: t.hintText[lang] ?? '',
      options: s.options.map((o) => ({ ...o, body: t.options[o.id]?.[lang] ?? '' })),
      matchPairs: s.matchPairs.map((p) => ({
        ...p,
        left: t.pairsLeft[p.id]?.[lang] ?? '',
        right: t.pairsRight[p.id]?.[lang] ?? '',
      })),
      sequence: s.sequence.map((_, i) => t.sequence[i]?.[lang] ?? ''),
    });
  },

  getI18nSnapshot: () => mergeSnapshot(get()),

  setActiveQuestion: (question) => {
    if (!question) {
      set({
        activeQuestion: null,
        questionType: null,
        options: DEFAULT_OPTIONS,
        matchPairs: [],
        sequence: [],
        hints: [],
        solutionText: '',
        questionBody: '',
        contentLang: 'en',
        i18nText: EMPTY_I18N,
        isDirty: false,
        ...DEFAULT_META,
      });
      return;
    }
    set({
      activeQuestion: question,
      // Seed per-language maps from the read response (old i18n content).
      contentLang: 'en',
      i18nText: (() => {
        const src = question.i18nSource ?? {};
        const opts = question.options ?? [];
        const optionMaps: Record<string, I18nMap> = {};
        opts.forEach((o, i) => { if (src.options?.[i]) optionMaps[o.id] = src.options[i]!; });
        const pairs = question.editorState?.matchPairs ?? [];
        const pairsLeft: Record<string, I18nMap> = {};
        const pairsRight: Record<string, I18nMap> = {};
        pairs.forEach((p, i) => {
          if (src.pairsLeft?.[i]) pairsLeft[p.id] = src.pairsLeft[i]!;
          if (src.pairsRight?.[i]) pairsRight[p.id] = src.pairsRight[i]!;
        });
        return {
          questionBody: src.question ?? {},
          answerText: src.answer ?? {},
          sentence: src.sentence ?? {},
          solutionText: src.solution ?? {},
          hintText: src.hint ?? {},
          options: optionMaps,
          pairsLeft,
          pairsRight,
          sequence: src.sequence ?? [],
        };
      })(),
      questionType: (question.questionType as QuestionType) ?? null,
      options: question.options ?? DEFAULT_OPTIONS,
      matchPairs: question.editorState?.matchPairs ?? [],
      sequence: question.editorState?.sequence ?? [],
      hints: question.hints ?? [],
      // Question-level hint: entry referenced by outcomeDeclaration.hint uuid.
      hintText: (() => {
        const hintId = (question.outcomeDeclaration as Record<string, Record<string, unknown>> | undefined)
          ?.hint?.defaultValue;
        const hint = question.hints?.find((h) => h.id === hintId) ?? question.hints?.[0];
        return hint?.body ?? '';
      })(),
      // Solution: html keeps the text; video/audio keep the asset id in
      // value — resolve name/src/thumbnail from the question's media[].
      ...(() => {
        const sol = question.solutions?.[0];
        const solType = (sol?.type ?? '') as SolutionType;
        if (solType === 'video' || solType === 'audio') {
          const media = question.media?.find((m) => m.id === sol?.value);
          return {
            solutionType: solType,
            solutionUUID: sol?.id ?? '',
            solutionText: '',
            solutionAsset: media
              ? { id: media.id, src: media.src, name: media.name ?? media.id, thumbnail: media.thumbnail }
              : (sol?.value ? { id: sol.value, src: '', name: sol.value } : null),
          };
        }
        return {
          solutionType: (sol?.value ? 'html' : '') as SolutionType,
          solutionUUID: sol?.id ?? '',
          solutionText: sol?.value ?? '',
          solutionAsset: null,
        };
      })(),
      answerText: question.editorState?.answer ?? '',
      sentence: question.editorState?.sentence ?? '',
      questionBody: question.editorState?.question ?? question.body ?? '',
      isDirty: false,
      // Metadata from the question object, fall back to defaults
      difficultyLevel: question.difficultyLevel ?? DEFAULT_META.difficultyLevel,
      bloomsLevel: question.bloomsLevel ?? DEFAULT_META.bloomsLevel,
      purpose: question.purpose ?? DEFAULT_META.purpose,
      maxScore: question.maxScore ?? DEFAULT_META.maxScore,
      expectedDuration: question.expectedDuration ?? DEFAULT_META.expectedDuration,
      showHints: question.showHints ?? DEFAULT_META.showHints,
      showSolutions: question.showSolutions ?? DEFAULT_META.showSolutions,
      isPartialScore: question.isPartialScore ?? DEFAULT_META.isPartialScore,
      evalUnordered: question.evalUnordered ?? DEFAULT_META.evalUnordered,
    });
  },

  setQuestionType: (type) => set({ questionType: type, isDirty: true }),
  setQuestionBody: (body) => set({ questionBody: body, isDirty: true }),

  setOptions: (options) => set({ options, isDirty: true }),
  updateOption: (id, patch) =>
    set((s) => ({
      options: s.options.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      isDirty: true,
    })),
  addOption: () =>
    set((s) => ({
      options: [...s.options, { id: makeId(), body: '', isCorrect: false }],
      isDirty: true,
    })),
  removeOption: (id) =>
    set((s) => ({ options: s.options.filter((o) => o.id !== id), isDirty: true })),

  setMatchPairs: (pairs) => set({ matchPairs: pairs, isDirty: true }),
  addMatchPair: () =>
    set((s) => ({
      matchPairs: [...s.matchPairs, { id: makeId(), left: '', right: '' }],
      isDirty: true,
    })),
  removeMatchPair: (id) =>
    set((s) => ({ matchPairs: s.matchPairs.filter((p) => p.id !== id), isDirty: true })),
  updateMatchPair: (id, patch) =>
    set((s) => ({
      matchPairs: s.matchPairs.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      isDirty: true,
    })),

  setSequence: (seq) => set({ sequence: seq, isDirty: true }),

  setHints: (hints) => set({ hints, isDirty: true }),
  setHintText: (text) => set({ hintText: text, isDirty: true }),
  addHint: () =>
    set((s) => ({ hints: [...s.hints, { id: makeId(), body: '' }], isDirty: true })),
  removeHint: (id) =>
    set((s) => ({ hints: s.hints.filter((h) => h.id !== id), isDirty: true })),
  updateHint: (id, body) =>
    set((s) => ({
      hints: s.hints.map((h) => (h.id === id ? { ...h, body } : h)),
      isDirty: true,
    })),

  setSolutionText: (text) => set({ solutionText: text, isDirty: true }),
  setSolutionType: (type) => set({ solutionType: type, solutionAsset: null, isDirty: true }),
  setSolutionAsset: (asset) => set({ solutionAsset: asset, isDirty: true }),
  clearSolution: () =>
    set({ solutionType: '', solutionAsset: null, solutionText: '', isDirty: true }),
  setAnswerText: (text) => set({ answerText: text, isDirty: true }),
  setSentence: (text) => set({ sentence: text, isDirty: true }),

  setDifficultyLevel: (v) => set({ difficultyLevel: v, isDirty: true }),
  setBloomsLevel: (v) => set({ bloomsLevel: v, isDirty: true }),
  setPurpose: (v) => set({ purpose: v, isDirty: true }),
  setMaxScore: (v) => set({ maxScore: Math.max(0, v), isDirty: true }),
  setExpectedDuration: (v) => set({ expectedDuration: Math.max(0, v), isDirty: true }),
  setShowHints: (v) => set({ showHints: v, isDirty: true }),
  setShowSolutions: (v) => set({ showSolutions: v, isDirty: true }),
  setIsPartialScore: (v) => set({ isPartialScore: v, isDirty: true }),
  setEvalUnordered: (v) => set({ evalUnordered: v, isDirty: true }),

  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  resetQuestion: () =>
    set({
      activeQuestion: null,
      questionType: null,
      options: DEFAULT_OPTIONS,
      matchPairs: [],
      sequence: [],
      hints: [],
      hintText: '',
      solutionType: '' as SolutionType,
      solutionUUID: '',
      solutionAsset: null,
      solutionText: '',
      answerText: '',
      sentence: '',
      questionBody: '',
      contentLang: 'en',
      i18nText: EMPTY_I18N,
      isDirty: false,
      isSaving: false,
      ...DEFAULT_META,
    }),
}));
