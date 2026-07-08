/**
 * Multilingual save serialization — merges the store's per-language text
 * maps into the question metadata the way the old editor persisted them:
 * a field stays a plain string when only English is filled, otherwise it
 * becomes a {lang: text} map (normalizeI18n), with per-language rendered
 * HTML for body/answer and i18n blocks for REO.
 */
import { normalizeI18n, readI18n } from './i18nField';
import { htmlToText } from './html';
import type { I18nMap } from './i18nField';
import type { II18nText, ISolutionAsset } from '../store/question.store';
import type { QuestionType, IOption, IMatchPair } from '../types/question';

interface Args {
  type: QuestionType;
  i18n: II18nText;
  options: IOption[];
  matchPairs: IMatchPair[];
  hintUuid: string;
  solutionId: string;
  /** Per-language video/audio asset — solutionType/solutionText live on `i18n`. */
  solutionAsset: Record<string, ISolutionAsset | null>;
  assetSolutionHtml: (type: 'video' | 'audio', asset: { id: string; src: string; thumbnail?: string }) => string;
  buildBodyHtml: (type: QuestionType, questionHtml: string) => string;
  answerWrap: (text: string) => string;
}

const dropEmpty = (m: I18nMap | undefined): I18nMap =>
  Object.fromEntries(Object.entries(m ?? {}).filter(([, v]) => v && v.trim()));

const hasExtraLangs = (m: I18nMap): boolean => Object.keys(m).some((l) => l !== 'en');

function reoWords(sentence: string): string[] {
  // Entity-decoding extraction, same as useSaveQuestion/ReoEditor.
  return htmlToText(sentence).trim().split(/\s+/).filter(Boolean);
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
  // metadata.answer is a schema-typed String field for every question type,
  // not just choice — old editor JSON.stringifies it here too
  // (question.component.ts setQuestionProperties, non-choice branch).
  const ansMap = dropEmpty(a.i18n.answerText);
  if (a.type === 'sa' && hasExtraLangs(ansMap)) {
    es.answer = normalizeI18n(ansMap);
    meta.answer = JSON.stringify(
      Object.fromEntries(Object.entries(ansMap).map(([l, t]) => [l, a.answerWrap(t)])),
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

  // ── MCQ/boolean answer — the correct option's per-language label, not
  // whichever language tab happened to be active at save time. Old editor
  // (question.component.ts setQuestionProperties, choice branch) builds this
  // from the interactions label map and, when more than English is filled,
  // JSON.stringifies the per-language map rather than sending an object —
  // `answer` is a string-typed schema field, unlike `body`.
  if (a.type === 'mcq' || a.type === 'boolean') {
    const correct = a.options.find((o) => o.isCorrect);
    const answerMap = correct ? dropEmpty(a.i18n.options[correct.id]) : {};
    if (hasExtraLangs(answerMap)) {
      const wrap = (html: string) => `<div class='answer-container'><div class='answer-body'>${html}</div></div>`;
      meta.answer = JSON.stringify(
        Object.fromEntries(Object.entries(answerMap).map(([l, t]) => [l, wrap(t)])),
      );
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
      // Top-level metadata.sentence is a schema-typed String field — the
      // backend rejects an object ("Metadata sentence should be a/an String
      // value"). Old editor explicitly collapses it back to the 'en' slot
      // (question.component.ts setQuestionProperties) and keeps the full
      // per-language map only in editorState.sentence, which is opaque JSON.
      meta.sentence = readI18n(sMap, 'en');
      es.sentence = normalizeI18n(sMap);
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
  // Re-adding hints for non-English text must keep the outcomeDeclaration
  // reference and editorState mirror consistent — useSaveQuestion omits all
  // three when the English hint is cleared, and a hints object whose uuid
  // isn't referenced from outcomeDeclaration is a dangling entry.
  const hintMap = dropEmpty(a.i18n.hintText);
  if (Object.keys(hintMap).length) {
    const hints = { [a.hintUuid]: { ...hintMap } };
    meta.hints = hints;
    es.hints = hints;
    const od = meta.outcomeDeclaration as Record<string, Record<string, unknown>> | undefined;
    if (od?.hint) od.hint.defaultValue = a.hintUuid;
  }

  // ── solution (html/video/audio) ────────────────────────────────────────
  // Driven by i18n.solutionType — html keeps text (i18n.solutionText),
  // video/audio keep the per-language asset id (a.solutionAsset).
  const solTextMap = dropEmpty(a.i18n.solutionText);
  const solEntries: Record<string, { type: string; value: string }> = {};
  const solHtmlByLang: I18nMap = {};
  for (const [lang, type] of Object.entries(a.i18n.solutionType)) {
    if (type === 'html') {
      const text = solTextMap[lang];
      if (text) {
        solEntries[lang] = { type: 'html', value: text };
        solHtmlByLang[lang] = text;
      }
    } else if (type === 'video' || type === 'audio') {
      const asset = a.solutionAsset[lang];
      if (asset) {
        solEntries[lang] = { type, value: asset.id };
        solHtmlByLang[lang] = a.assetSolutionHtml(type, asset);
      }
    }
  }
  if (Object.keys(solEntries).some((l) => l !== 'en')) {
    es.solutions = [{ id: a.solutionId, value: solEntries }];
    meta.solutions = { [a.solutionId]: normalizeI18n(solHtmlByLang) };
  }
}
