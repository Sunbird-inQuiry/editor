import { create } from 'zustand';
import type { IQuestion, QuestionType, IOption, IMatchPair, IHint } from '../types/question';

interface QuestionState {
  activeQuestion: IQuestion | null;
  questionType: QuestionType | null;
  isDirty: boolean;
  isSaving: boolean;
  options: IOption[];
  matchPairs: IMatchPair[];
  sequence: string[];
  hints: IHint[];
  solutionText: string;
  /** Model answer for non-interactive questions (SA etc.) — old editorState.answer */
  answerText: string;
  /** REO: the correct sentence — old editorState.sentence */
  sentence: string;
  questionBody: string;
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
  addHint: () => void;
  removeHint: (id: string) => void;
  updateHint: (id: string, body: string) => void;
  setSolutionText: (text: string) => void;
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

export const useQuestionStore = create<QuestionState>((set) => ({
  activeQuestion: null,
  questionType: null,
  isDirty: false,
  isSaving: false,
  options: DEFAULT_OPTIONS,
  matchPairs: [],
  sequence: [],
  hints: [],
  solutionText: '',
  answerText: '',
  sentence: '',
  questionBody: '',
  ...DEFAULT_META,

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
        isDirty: false,
        ...DEFAULT_META,
      });
      return;
    }
    set({
      activeQuestion: question,
      questionType: (question.questionType as QuestionType) ?? null,
      options: question.options ?? DEFAULT_OPTIONS,
      matchPairs: question.editorState?.matchPairs ?? [],
      sequence: question.editorState?.sequence ?? [],
      hints: question.hints ?? [],
      solutionText: question.solutions?.[0]?.value ?? '',
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
      solutionText: '',
      answerText: '',
      sentence: '',
      questionBody: '',
      isDirty: false,
      isSaving: false,
      ...DEFAULT_META,
    }),
}));
