/**
 * Multilingual save serialization — merges the store's per-language text
 * maps into the question metadata the way the old editor persisted them:
 * a field stays a plain string when only English is filled, otherwise it
 * becomes a {lang: text} map (normalizeI18n), with per-language rendered
 * HTML for body/answer and i18n blocks for REO.
 */
import { normalizeI18n } from './i18nField';
import type { I18nMap } from './i18nField';
import type { II18nText } from '../store/question.store';
import type { QuestionType, IOption, IMatchPair } from '../types/question';

interface Args {
  type: QuestionType;
  i18n: II18nText;
  options: IOption[];
  matchPairs: IMatchPair[];
  hintUuid: string;
  solutionId: string;
  solutionType: string;
  buildBodyHtml: (type: QuestionType, questionHtml: string) => string;
  answerWrap: (text: string) => string;
}

const dropEmpty = (m: I18nMap | undefined): I18nMap =>
  Object.fromEntries(Object.entries(m ?? {}).filter(([, v]) => v && v.trim()));

const hasExtraLangs = (m: I18nMap): boolean => Object.keys(m).some((l) => l !== 'en');

function reoWords(sentence: string): string[] {
  return sentence.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean);
}

export function applyContentI18n(meta: Record<string, unknown>, a: Args): void {
  const es = meta.editorState as Record<string, unknown>;
  const interactions = meta.interactions as Record<string, Record<string, unknown>> | undefined;

  // ── question stem + body ────────────────────────────────────────────────
  const qMap = dropEmpty(a.i18n.questionBody);
  if (hasExtraLangs(qMap)) {
    es.question = normalizeI18n(qMap);
    meta.body = Object.fromEntries(
      Object.entries(qMap).map(([l, t]) => [l, a.buildBodyHtml(a.type, t)]),
    );
  }

  // ── SA answer ───────────────────────────────────────────────────────────
  const ansMap = dropEmpty(a.i18n.answerText);
  if (a.type === 'sa' && hasExtraLangs(ansMap)) {
    es.answer = normalizeI18n(ansMap);
    meta.answer = Object.fromEntries(
      Object.entries(ansMap).map(([l, t]) => [l, a.answerWrap(t)]),
    );
  }

  // ── MCQ options ─────────────────────────────────────────────────────────
  if (a.type === 'mcq') {
    const anyOptExtra = a.options.some((o) => hasExtraLangs(dropEmpty(a.i18n.options[o.id])));
    if (anyOptExtra) {
      const esOptions = es.options as Array<Record<string, Record<string, unknown>>> | undefined;
      const itOptions = interactions?.response1?.options as Array<Record<string, unknown>> | undefined;
      a.options.forEach((o, i) => {
        const map = dropEmpty(a.i18n.options[o.id]);
        if (!Object.keys(map).length) return;
        if (esOptions?.[i]?.value) esOptions[i]!.value!.body = normalizeI18n(map);
        if (itOptions?.[i]) itOptions[i]!.label = { ...map };
      });
    }
  }

  // ── MTF pairs ───────────────────────────────────────────────────────────
  if (a.type === 'mtf') {
    const left = a.matchPairs.map((p) => dropEmpty(a.i18n.pairsLeft[p.id]));
    const right = a.matchPairs.map((p) => dropEmpty(a.i18n.pairsRight[p.id]));
    if (left.some(hasExtraLangs) || right.some(hasExtraLangs)) {
      const pairs = a.matchPairs.map((_, i) => ({ left: { ...left[i] }, right: { ...right[i] } }));
      meta.pairs = pairs;
      es.pairs = pairs;
      const it = interactions?.response1?.options as Record<string, Array<Record<string, unknown>>> | undefined;
      if (it) {
        it.left?.forEach((o, i) => { o.label = { ...left[i] }; });
        it.right?.forEach((o, i) => { o.label = { ...right[i] }; });
      }
    }
  }

  // ── SEQ item labels ─────────────────────────────────────────────────────
  if (a.type === 'seq') {
    const maps = a.i18n.sequence.map(dropEmpty);
    if (maps.some(hasExtraLangs)) {
      const esOptions = es.options as Array<Record<string, unknown>> | undefined;
      const itOptions = interactions?.response1?.options as Array<Record<string, unknown>> | undefined;
      maps.forEach((map, i) => {
        if (!Object.keys(map).length) return;
        const label = normalizeI18n(map);
        if (esOptions?.[i]) esOptions[i]!.label = label;
        if (itOptions?.[i]) itOptions[i]!.label = label;
      });
    }
  }

  // ── REO sentence — per-language word options + i18n blocks ─────────────
  if (a.type === 'reo') {
    const sMap = dropEmpty(a.i18n.sentence);
    if (hasExtraLangs(sMap)) {
      meta.sentence = normalizeI18n(sMap);
      es.sentence = meta.sentence;
      const blocks: Record<string, unknown> = {};
      const rdBlocks: Record<string, unknown> = {};
      for (const [lang, text] of Object.entries(sMap)) {
        const words = reoWords(text);
        const opts = words.map((w, i) => ({ value: String.fromCharCode(65 + i), label: w }));
        const order = opts.map((o) => o.value);
        blocks[lang] = { options: opts, correctResponse: order };
        rdBlocks[lang] = { correctResponse: { value: order } };
      }
      es.i18n = blocks;
      if (interactions?.response1) interactions.response1.i18n = blocks;
      const rd = (meta.responseDeclaration as Record<string, Record<string, unknown>> | undefined)?.response1;
      if (rd) rd.i18n = rdBlocks;
    }
  }

  // ── hint ────────────────────────────────────────────────────────────────
  const hintMap = dropEmpty(a.i18n.hintText);
  if (Object.keys(hintMap).length) {
    meta.hints = { [a.hintUuid]: { ...hintMap } };
  }

  // ── text solution ───────────────────────────────────────────────────────
  const solMap = dropEmpty(a.i18n.solutionText);
  if (a.solutionType === 'html' && hasExtraLangs(solMap)) {
    es.solutions = [{
      id: a.solutionId,
      value: Object.fromEntries(Object.entries(solMap).map(([l, v]) => [l, { type: 'html', value: v }])),
    }];
    meta.solutions = { [a.solutionId]: normalizeI18n(solMap) };
  }
}
