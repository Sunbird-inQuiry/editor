import { describe, it, expect, beforeEach } from 'vitest';
import { writeI18n, normalizeI18n, readI18nForEditor, asI18nMap } from './i18nField';
import { applyContentI18n } from './i18nSerialize';
import { useQuestionStore, type II18nText } from '../store/question.store';

describe('i18nField (old editor port)', () => {
  it('keeps plain string for en-only, map for multilang', () => {
    expect(writeI18n(undefined, 'en', 'hello')).toBe('hello');
    expect(writeI18n('hello', 'ar', 'مرحبا')).toEqual({ en: 'hello', ar: 'مرحبا' });
    expect(normalizeI18n({ en: 'x', ar: '' })).toBe('x');
    expect(normalizeI18n({ en: '', ar: '' })).toBe('');
  });

  it('readI18nForEditor returns empty for unauthored lang slots', () => {
    expect(readI18nForEditor('hello', 'ar')).toBe('');
    expect(readI18nForEditor({ en: 'a', fr: 'b' }, 'fr')).toBe('b');
    expect(asI18nMap('x')).toEqual({ en: 'x' });
  });
});

describe('question store language switching', () => {
  beforeEach(() => {
    useQuestionStore.getState().resetQuestion();
  });

  it('snapshots current text and loads the selected language', () => {
    const s = useQuestionStore.getState();
    s.setQuestionBody('<p>What is 2+2?</p>');
    s.setAnswerText('<p>4</p>');
    s.switchContentLang('ar');

    let st = useQuestionStore.getState();
    expect(st.contentLang).toBe('ar');
    expect(st.questionBody).toBe(''); // no ar text yet
    expect(st.i18nText.questionBody.en).toBe('<p>What is 2+2?</p>');

    st.setQuestionBody('<p>ما هو 2+2؟</p>');
    useQuestionStore.getState().switchContentLang('en');

    st = useQuestionStore.getState();
    expect(st.questionBody).toBe('<p>What is 2+2?</p>');
    expect(st.i18nText.questionBody.ar).toBe('<p>ما هو 2+2؟</p>');
    expect(st.getI18nSnapshot().answerText.en).toBe('<p>4</p>');
  });

  it('switches option text per language keeping structure', () => {
    const s = useQuestionStore.getState();
    const [o1] = s.options;
    s.updateOption(o1!.id, { body: 'Four', isCorrect: true });
    s.switchContentLang('fr');
    let st = useQuestionStore.getState();
    expect(st.options[0]!.body).toBe('');
    expect(st.options[0]!.isCorrect).toBe(true); // structure shared
    st.updateOption(st.options[0]!.id, { body: 'Quatre' });
    useQuestionStore.getState().switchContentLang('en');
    st = useQuestionStore.getState();
    expect(st.options[0]!.body).toBe('Four');
    expect(st.getI18nSnapshot().options[o1!.id]!.fr).toBe('Quatre');
  });
});

describe('applyContentI18n (save serialization)', () => {
  const baseI18n = (over: Partial<II18nText>): II18nText => ({
    questionBody: {}, answerText: {}, sentence: {}, solutionText: {}, hintText: {},
    options: {}, pairsLeft: {}, pairsRight: {}, sequence: [], ...over,
  });

  it('emits lang maps for stem/body and mcq options', () => {
    const meta: Record<string, unknown> = {
      body: '<div>en-body</div>',
      editorState: { question: '<p>en</p>', options: [{ answer: true, value: { body: 'Four', value: 0 } }] },
      interactions: { response1: { options: [{ label: { en: 'Four' }, value: 0, hint: '' }] } },
    };
    applyContentI18n(meta, {
      type: 'mcq',
      i18n: baseI18n({
        questionBody: { en: '<p>en</p>', ar: '<p>ar</p>' },
        options: { o1: { en: 'Four', ar: 'أربعة' } },
      }),
      options: [{ id: 'o1', body: 'Four', isCorrect: true }],
      matchPairs: [],
      hintUuid: 'h-1',
      solutionId: 's-1',
      solutionType: '',
      buildBodyHtml: (_t, q) => `<div>${q}</div>`,
      answerWrap: (t) => `<a>${t}</a>`,
    });
    expect((meta.editorState as Record<string, unknown>).question).toEqual({ en: '<p>en</p>', ar: '<p>ar</p>' });
    expect(meta.body).toEqual({ en: '<div><p>en</p></div>', ar: '<div><p>ar</p></div>' });
    const esOpts = (meta.editorState as { options: Array<{ value: { body: unknown } }> }).options;
    expect(esOpts[0]!.value.body).toEqual({ en: 'Four', ar: 'أربعة' });
    const itOpts = (meta.interactions as { response1: { options: Array<{ label: unknown }> } }).response1.options;
    expect(itOpts[0]!.label).toEqual({ en: 'Four', ar: 'أربعة' });
  });

  it('emits multilang hints and REO i18n blocks', () => {
    const meta: Record<string, unknown> = {
      sentence: 'The tree is tall',
      editorState: { sentence: 'The tree is tall' },
      interactions: { response1: { type: 'order', options: [] } },
      responseDeclaration: { response1: { correctResponse: { value: ['A', 'B'] } } },
    };
    applyContentI18n(meta, {
      type: 'reo',
      i18n: baseI18n({
        sentence: { en: 'The tree is tall', fr: 'Le arbre est grand' },
        hintText: { en: 'think', fr: 'pense' },
      }),
      options: [], matchPairs: [],
      hintUuid: 'h-9', solutionId: 's-9', solutionType: '',
      buildBodyHtml: (_t, q) => q,
      answerWrap: (t) => t,
    });
    expect(meta.hints).toEqual({ 'h-9': { en: 'think', fr: 'pense' } });
    expect(meta.sentence).toEqual({ en: 'The tree is tall', fr: 'Le arbre est grand' });
    const blocks = (meta.editorState as { i18n: Record<string, { correctResponse: string[] }> }).i18n;
    expect(blocks.en!.correctResponse).toEqual(['A', 'B', 'C', 'D']);
    expect(blocks.fr!.correctResponse).toEqual(['A', 'B', 'C', 'D']);
    const rd = (meta.responseDeclaration as { response1: { i18n: Record<string, unknown> } }).response1;
    expect(rd.i18n).toHaveProperty('fr');
  });
});
