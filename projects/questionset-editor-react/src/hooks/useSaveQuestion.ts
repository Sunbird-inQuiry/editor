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
import { notifySuccess, notifyError, apiErrorMessage } from '../utils/notify';
import { label } from '../utils/labels';
import { useQuestionStore } from '../store/question.store';
import { useEditorStore } from '../store/editor.store';
import { useTreeStore } from '../store/tree.store';
// updateQuestion (direct PATCH) no longer used — old editor creates/updates
// via hierarchy update for consistent full-metadata delivery.
import { useSaveHierarchy } from './useSaveHierarchy';
import { getUserId } from '../utils/context';
import { applyContentI18n } from '../utils/i18nSerialize';
import { resolveQuestionType } from '../registry';
import { htmlToText } from '../utils/html';
import type { QuestionType, IOption, IMatchPair } from '../types/question';
import { v4 as genUuid } from 'uuid';

// ---------------------------------------------------------------------------
// body HTML — old editor wraps question in specific template divs
// ---------------------------------------------------------------------------
// Old editor's "Grid" MCQ layout button (options.component.html) sets
// templateId to 'mcq-vertical-split', not 'mcq-grid' — the UI label says
// "Grid" but the persisted template string doesn't follow the layout name.
function mcqTemplateId(layout: 'vertical' | 'grid' | 'horizontal'): string {
  return layout === 'grid' ? 'mcq-vertical-split' : `mcq-${layout}`;
}

function parseBlanks(questionHtml: string): string[] {
  // Extract from entity-decoded plain text — inline markup (<strong>) or
  // &nbsp; inside [[ ]] would otherwise become part of the correct answer.
  return [...htmlToText(questionHtml).matchAll(/\[\[(.+?)\]\]/g)].map((m) => m[1]!.trim());
}

function buildBodyHtml(type: QuestionType, questionHtml: string): string {
  if (type === 'mcq' || type === 'boolean') {
    return `<div class='question-body' tabindex='-1'><div class='mcq-title' tabindex='0'>${questionHtml}</div><div data-choice-interaction='response1' class='${type === 'boolean' ? 'boolean' : 'mcq-vertical'}'></div></div>`;
  }
  if (type === 'ftb') {
    // Old editor replaces each [[answer]] blank with [[responseN]] in body.
    let i = 0;
    return questionHtml.replace(/\[\[(.+?)\]\]/g, () => `[[response${++i}]]`);
  }
  if (type === 'mtf') {
    return `<div class='question-body' tabindex='-1'><div class='mtf-title' tabindex='0'>${questionHtml}</div><div data-match-interaction='response1'></div></div>`;
  }
  if (type === 'seq' || type === 'reo') {
    return `<div class='question-body' tabindex='-1'><div class='order-title' tabindex='0'>${questionHtml}</div><div data-ordered-interaction='response1'></div></div>`;
  }
  return questionHtml;
}

// MTF: left options keyed by index, right options keyed by letters (a, b, c…)
// — mirrors old mtf.component.ts prepareMtfBody().
function wrapPairs(pairs: IMatchPair[]) {
  return pairs.map((p) => ({ left: { en: p.left }, right: { en: p.right } }));
}
function rightKey(i: number): string {
  return String.fromCharCode(97 + i);
}

// SEQ: options keyed by uppercase letters (A, B, C…) in correct order —
// mirrors old order.component.ts prepareOrderBody().
function seqOptions(sequence: string[]) {
  return sequence.map((label, i) => ({ value: String.fromCharCode(65 + i), label }));
}
function seqOrder(sequence: string[]): string[] {
  return sequence.map((_, i) => String.fromCharCode(65 + i));
}

// REO: sentence split into word options (A, B, C…) — mirrors old reorder
// component; old payloads also embed an i18n.en copy of options/correctResponse.
function reoWords(sentence: string): string[] {
  // Same entity-decoding extraction as the ReoEditor chips — a tag-strip
  // regex would serialize `The&nbsp;cat` as one option.
  return htmlToText(sentence).trim().split(/\s+/).filter(Boolean);
}
function reoOptions(sentence: string) {
  return seqOptions(reoWords(sentence));
}

/**
 * Player-facing solution HTML for video/audio — old editor's
 * getAssetSolutionHtml template (data-asset-variable + poster + sources).
 */
function assetSolutionHtml(type: 'video' | 'audio', asset: { id: string; src: string; thumbnail?: string }): string {
  const poster = asset.thumbnail ?? '';
  if (type === 'video') {
    return `<video data-asset-variable='${asset.id}' width='400' controls='' poster='${poster}'><source type='video/mp4' src='${asset.src}'><source type='video/webm' src='${asset.src}'></video>`;
  }
  return `<audio data-asset-variable='${asset.id}' width='400' controls='' poster='${poster}'><source type='audio/mp3' src='${asset.src}'><source type='audio/wav' src='${asset.src}'></audio>`;
}

/**
 * media[] — one entry per asset referenced in the question content, like the
 * old editor's mediaArr: {id, type, src, baseUrl}. Assets are identified by
 * data-asset-variable or the do_ id embedded in the src path.
 */
function collectMedia(htmls: Array<string | undefined>, baseUrl: string) {
  const media: Array<{ id: string; type: string; src: string; baseUrl: string }> = [];
  const seen = new Set<string>();
  for (const html of htmls) {
    if (!html) continue;
    for (const tag of html.matchAll(/<img[^>]*>/gi)) {
      const img = tag[0];
      const src = img.match(/src=["']([^"']+)["']/i)?.[1];
      if (!src) continue;
      const id =
        img.match(/data-asset-variable=["']([^"']+)["']/i)?.[1] ??
        src.match(/(do_[A-Za-z0-9]+)/)?.[1];
      if (!id || seen.has(id)) continue;
      seen.add(id);
      media.push({ id, type: 'image', src, baseUrl });
    }
  }
  return media;
}

// ---------------------------------------------------------------------------
// interactions — old editor format
// ---------------------------------------------------------------------------
function buildInteractions(type: QuestionType, options: IOption[], questionBody = '', matchPairs: IMatchPair[] = [], sequence: string[] = [], sentence = ''): Record<string, unknown> {
  if (type === 'reo') {
    const opts = reoOptions(sentence);
    const correctResponse = opts.map((o) => o.value);
    return {
      response1: {
        type: 'order',
        options: opts,
        i18n: { en: { options: opts, correctResponse } },
        validation: { required: 'Yes' },
      },
    };
  }
  if (type === 'seq') {
    return {
      response1: {
        type: 'order',
        options: seqOptions(sequence),
        validation: { required: 'Yes' },
      },
    };
  }
  if (type === 'mtf') {
    return {
      response1: {
        type: 'match',
        options: {
          left: matchPairs.map((p, i) => ({ value: String(i), label: { en: p.left } })),
          right: matchPairs.map((p, i) => ({ value: rightKey(i), label: { en: p.right } })),
        },
        validation: { required: 'Yes' },
      },
    };
  }
  if (type === 'mcq' || type === 'boolean') {
    return {
      response1: {
        type: 'choice',
        options: options.map((o, i) => ({ label: { en: o.body }, value: i, hint: '' })),
        validation: { required: 'Yes' },
      },
    };
  }
  if (type === 'ftb') {
    // One responseN per blank; only the first carries the validation block.
    const blanks = parseBlanks(questionBody);
    const interactions: Record<string, unknown> = {};
    (blanks.length ? blanks : ['']).forEach((_, i) => {
      interactions[`response${i + 1}`] =
        i === 0 ? { type: 'text', validation: { required: 'Yes' } } : { type: 'text' };
    });
    return interactions;
  }
  return {};
}

// ---------------------------------------------------------------------------
// responseDeclaration — old editor format
// ---------------------------------------------------------------------------
function buildResponseDeclaration(
  type: QuestionType, options: IOption[], questionBody = '',
  matchPairs: IMatchPair[] = [], isPartialScore = true, sequence: string[] = [], sentence = '',
  evalUnordered = false,
): Record<string, unknown> {
  if (type === 'reo') {
    const value = reoOptions(sentence).map((o) => o.value);
    return {
      response1: {
        cardinality: 'ordered',
        type: 'string',
        correctResponse: { value },
        i18n: { en: { correctResponse: { value } } },
      },
    };
  }
  if (type === 'seq') {
    const rd: Record<string, unknown> = {
      cardinality: 'ordered',
      type: 'string',
      correctResponse: { value: seqOrder(sequence) },
    };
    if (isPartialScore) {
      rd.mapping = seqOrder(sequence).map((v) => ({ value: v, score: 1 }));
    }
    return { response1: rd };
  }
  if (type === 'mtf') {
    const correctValue: Record<string, string> = {};
    matchPairs.forEach((_, i) => { correctValue[String(i)] = rightKey(i); });
    const rd: Record<string, unknown> = {
      cardinality: 'single',
      type: 'map',
      correctResponse: { value: correctValue },
    };
    if (isPartialScore) {
      rd.mapping = matchPairs.map((_, i) => ({ key: String(i), value: rightKey(i), score: 1 }));
    }
    return { response1: rd };
  }
  if (type === 'ftb') {
    // Old editor: one responseN per blank. By default each blank's mapping
    // holds only its own answer; evalUnordered replaces every blank's
    // mapping with the union of all answers so any blank accepts any
    // answer, in any order.
    const blanks = parseBlanks(questionBody);
    const unionMapping = blanks.map((b) => ({ value: b, score: 1, caseSensitive: false }));
    const rd: Record<string, unknown> = {};
    blanks.forEach((b, i) => {
      rd[`response${i + 1}`] = {
        cardinality: 'single',
        type: 'string',
        correctResponse: { value: b },
        mapping: evalUnordered ? unionMapping : [{ value: b, score: 1, caseSensitive: false }],
      };
    });
    if (blanks.length) return rd;
  }
  if (type === 'mcq' || type === 'boolean') {
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
function buildEditorState(
  type: QuestionType, questionBody: string, options: IOption[], answerText: string,
  flags?: { isPartialScore: boolean; evalUnordered: boolean },
  matchPairs: IMatchPair[] = [],
  sequence: string[] = [],
  sentence = '',
) {
  if (type === 'mcq' || type === 'boolean') {
    return {
      options: options.map((o, i) => ({ answer: !!o.isCorrect, value: { body: o.body, value: i } })),
      question: questionBody,
    };
  }
  if (type === 'ftb' && flags) {
    // Old editorState keeps the original [[answer]] text plus scoring flags.
    return { isPartialScore: flags.isPartialScore, evalUnordered: flags.evalUnordered, question: questionBody };
  }
  if (type === 'mtf' && flags) {
    return { pairs: wrapPairs(matchPairs), isPartialScore: flags.isPartialScore, question: questionBody };
  }
  if (type === 'seq' && flags) {
    return {
      options: seqOptions(sequence),
      correctOrder: seqOrder(sequence),
      isPartialScore: flags.isPartialScore,
      question: questionBody,
    };
  }
  if (type === 'reo') {
    const opts = reoOptions(sentence);
    return {
      sentence,
      i18n: { en: { options: opts, correctResponse: opts.map((o) => o.value) } },
      question: questionBody,
    };
  }
  // Old editor's non-interactive editorState is { answer, question }.
  if (answerText) return { answer: answerText, question: questionBody };
  return { question: questionBody };
}

// ---------------------------------------------------------------------------
// answer HTML — correct option in old editor's answer container
// ---------------------------------------------------------------------------
function buildAnswerHtml(type: QuestionType, options: IOption[], answerText: string): string {
  if (type === 'mcq' || type === 'boolean') {
    const correct = options.find(o => o.isCorrect);
    return `<div class='answer-container'><div class='answer-body'>${correct?.body ?? ''}</div></div>`;
  }
  if (answerText) return `<div class='answer-container'><div class='answer-body'>${answerText}</div></div>`;
  return '';
}

// ---------------------------------------------------------------------------
// buildLiveQuestionMeta — the same metadata object useSaveQuestion sends to
// the backend, built purely from live in-memory state (no API call). Used
// both by save() below and by the question editor's pre-save preview, which
// (like old editor's previewContent()/getQuestionMetadata()) must reflect
// unsaved edits rather than the last-persisted version.
// ---------------------------------------------------------------------------
export function buildLiveQuestionMeta(): { questionName: string; questionMeta: Record<string, unknown> } | null {
  const {
    activeQuestion, questionType, questionBody, options, matchPairs, sequence,
    hintText, solutionText, solutionType, solutionAsset, solutionUUID,
    answerText, sentence, maxScore,
    isPartialScore, evalUnordered, layout, contentLang,
  } = useQuestionStore.getState();
  const { selectedNodeId, treeData } = useTreeStore.getState();
  const config = useEditorStore.getState().editorConfig;

  if (!questionType || !selectedNodeId) return null;

  const channel         = config?.context?.channel   ?? '';
  const createdBy       = getUserId(config?.context);
  const framework       = config?.context?.framework ?? '';
  // qType / category / interaction come from the question type registry.
  const typeDef = resolveQuestionType(questionType);
  const primaryCategory = typeDef?.primaryCategory ?? 'Multiple Choice Question';
  const qTypeValue = typeDef?.qType ?? 'MCQ';

  // Details-form values (childMetadata: name/Marks/…) live in treeCache —
  // they take precedence over auto-derived values, like the old editor.
  const formMeta = (useTreeStore.getState().treeCache[selectedNodeId] ?? {}) as Record<string, unknown>;
  const formName = typeof formMeta.name === 'string' && formMeta.name.trim() ? formMeta.name.trim() : undefined;
  const formMarks = Number(formMeta.maxScore);

  const isExisting = activeQuestion?.identifier && !activeQuestion.identifier.startsWith('temp-');
  const autoName = ((questionBody || '').replace(/<[^>]+>/g, '').slice(0, 60).trim() || 'Untitled Question');

  const questionName = formName
    ?? (isExisting ? activeQuestion?.name : undefined)
    ?? autoName;

    // Old editor's real save path (question.component.ts getOutcomeDeclaration)
    // always uses the Marks form field as outcomeDeclaration.maxScore.defaultValue,
    // for every question type, regardless of partial scoring — partial scoring
    // only changes cardinality/mapping, never the marks total itself.
    const blankCount =
      questionType === 'ftb' ? parseBlanks(questionBody).length :
        questionType === 'mtf' ? matchPairs.length : 0;
    const effectiveMaxScore =
      Number.isFinite(formMarks) && formMarks > 0 ? formMarks : (maxScore ?? 1);

    // 'multiple' only when the score is actually per-blank — FTB always, MTF
    // only with partial scoring (a scalar defaultValue must stay 'single',
    // matching the old editor's mtf.component).
    const maxScoreCardinality =
      (questionType === 'ftb' || (questionType === 'mtf' && isPartialScore)) && blankCount > 1
        ? 'multiple' : 'single';

    const hasInteractions = !!typeDef?.interactionType;

    // Multilingual text (old editor i18n) — visible text merged into the
    // active language before serialization.
    const i18nSnapshot = useQuestionStore.getState().getI18nSnapshot();
    const answerWrap = (t: string) => `<div class='answer-container'><div class='answer-body'>${t}</div></div>`;

    const mediaBaseUrl = config?.context?.host || window.location.origin;
    const questionMedia: Array<Record<string, unknown>> = collectMedia(
      [
        questionBody, answerText, solutionText, sentence,
        ...options.map((o) => o.body),
        ...matchPairs.flatMap((p) => [p.left, p.right]),
        ...sequence,
      ],
      mediaBaseUrl,
    );

    // Solution — old editor shape: editorState.solutions keeps {type, value}
    // per lang (value = asset id for video/audio); metadata.solutions maps
    // {uuid: rendered html}. This is just the current-tab fallback (keyed by
    // contentLang, not hardcoded 'en') — applyContentI18n() below merges in
    // every other language's solution once i18nSnapshot is available.
    const solutionId = solutionUUID || genUuid();
    let editorStateSolutions: Array<Record<string, unknown>> | undefined;
    let metadataSolutions: Record<string, unknown> = {};
    if (solutionType === 'html' && solutionText.trim()) {
      editorStateSolutions = [{ id: solutionId, value: { [contentLang]: { type: 'html', value: solutionText } } }];
      metadataSolutions = { [solutionId]: solutionText };
    } else if ((solutionType === 'video' || solutionType === 'audio') && solutionAsset) {
      editorStateSolutions = [{ id: solutionId, value: { [contentLang]: { type: solutionType, value: solutionAsset.id } } }];
      metadataSolutions = { [solutionId]: assetSolutionHtml(solutionType, solutionAsset) };
    }
    // Every language's attached video/audio (+ thumbnail) must land in
    // media[], not just whichever tab happens to be active at save time.
    for (const [lang, type] of Object.entries(i18nSnapshot.solutionType)) {
      if (type !== 'video' && type !== 'audio') continue;
      const asset = i18nSnapshot.solutionAsset[lang];
      if (!asset) continue;
      if (!questionMedia.some((m) => m.id === asset.id)) {
        questionMedia.push({
          id: asset.id, src: asset.src, type,
          assetId: asset.id, name: asset.name, baseUrl: mediaBaseUrl,
          ...(asset.thumbnail ? { thumbnail: asset.thumbnail } : {}),
        });
      }
      if (asset.thumbnail) {
        const thumbId = `${type}_${asset.id}`;
        if (!questionMedia.some((m) => m.id === thumbId)) {
          questionMedia.push({ id: thumbId, src: asset.thumbnail, type: 'image', baseUrl: mediaBaseUrl });
        }
      }
    }
    // Old editor reuses the hint uuid from the read response when present.
    const existingHint = (activeQuestion?.outcomeDeclaration as
      Record<string, Record<string, unknown>> | undefined)?.hint?.defaultValue;
    const hintUuid = (typeof existingHint === 'string' && existingHint) || genUuid();

    // Question-level hint — old editor: hints[uuid] = {en: text}, uuid
    // referenced from outcomeDeclaration.hint.defaultValue.
    const metadataHints: Record<string, unknown> = hintText.trim()
      ? { [hintUuid]: { en: hintText } }
      : {};

    // License only — board/medium/gradeLevel/subject/audience are no longer
    // copied from the root questionset onto every question.
    const rootMeta = (treeData[0]?.metadata ?? {}) as Record<string, unknown>;
    const taxonomy: Record<string, unknown> = {};
    if (rootMeta.license) taxonomy.license = rootMeta.license;
    // Old editor: channel read supplies the default license when unset.
    if (!taxonomy.license) {
      const defaultLicense = useEditorStore.getState().channelData?.defaultLicense;
      if (typeof defaultLicense === 'string' && defaultLicense) taxonomy.license = defaultLicense;
    }

    const questionMeta: Record<string, unknown> = {
      mimeType: 'application/vnd.sunbird.question',
      media: questionMedia,
      editorState: {
        ...buildEditorState(questionType, questionBody, options, answerText, { isPartialScore, evalUnordered }, matchPairs, sequence, sentence),
        ...(editorStateSolutions ? { solutions: editorStateSolutions } : {}),
        ...(Object.keys(metadataHints).length ? { hints: metadataHints } : {}),
      },
      body:        buildBodyHtml(questionType, questionBody),
      answer:      buildAnswerHtml(questionType, options, answerText),
      ...(questionType === 'mcq' ? { templateId: mcqTemplateId(layout) } : {}),
      ...(questionType === 'boolean' ? { templateId: 'boolean' } : {}),
      ...(questionType === 'ftb' ? {
        isPartialScore,
        evalUnordered,
        scoringMode: 'responseProcessing',
        responseProcessing: { template: isPartialScore ? 'MAP_RESPONSE' : 'MATCH_CORRECT' },
      } : {}),
      ...(questionType === 'mtf' ? {
        pairs: wrapPairs(matchPairs),
        isPartialScore,
        scoringMode: 'responseProcessing',
        responseProcessing: { template: 'MAP_RESPONSE' },
      } : {}),
      ...(questionType === 'seq' ? {
        correctOrder: seqOrder(sequence),
        templateId: `seq-${layout === 'horizontal' ? 'horizontal' : 'vertical'}`,
        ...(isPartialScore ? { isPartialScore: true } : {}),
        scoringMode: 'responseProcessing',
        responseProcessing: { template: isPartialScore ? 'MAP_RESPONSE' : 'MATCH_CORRECT' },
      } : {}),
      ...(questionType === 'reo' ? {
        sentence,
        scoringMode: 'responseProcessing',
        responseProcessing: { template: 'MATCH_CORRECT' },
      } : {}),
      maxScore:    effectiveMaxScore,
      name:        questionName,
      qType:       qTypeValue,
      primaryCategory,
      // Old editor sends interaction fields only for interactive types —
      // SA payloads carry just interactions:{} (no interactionTypes/
      // responseDeclaration/hints keys).
      ...(hasInteractions ? {
        interactionTypes: [typeDef?.interactionType ?? 'text'],
        responseDeclaration: buildResponseDeclaration(questionType, options, questionBody, matchPairs, isPartialScore, sequence, sentence, evalUnordered),
      } : {}),
      // Old MTF/SEQ payloads carry no hints key unless a hint is set.
      // hints key only when a hint actually exists — no empty {} with a
      // dangling outcomeDeclaration.hint reference.
      ...(Object.keys(metadataHints).length ? { hints: metadataHints } : {}),
      interactions: buildInteractions(questionType, options, questionBody, matchPairs, sequence, sentence),
      outcomeDeclaration: {
        maxScore: {
          cardinality: maxScoreCardinality,
          type: 'integer',
          defaultValue: effectiveMaxScore,
        },
        hint: {
          cardinality: 'single',
          type: 'string',
          defaultValue: Object.keys(metadataHints).length ? hintUuid : '',
        },
      },
      solutions: metadataSolutions,
      createdBy,
      channel,
      framework,
      ...taxonomy,
      // difficultyLevel/bloomsLevel are NOT valid Question schema
      // properties — the old editor never sends them in nodesModified.
    };

    applyContentI18n(questionMeta, {
      type: questionType,
      i18n: i18nSnapshot,
      options,
      matchPairs,
      hintUuid,
      solutionId,
      solutionAsset: i18nSnapshot.solutionAsset,
      assetSolutionHtml,
      buildBodyHtml,
      answerWrap,
    });

    return { questionName, questionMeta };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useSaveQuestion() {
  const { selectedNodeId, updateNode, replaceNodeId } = useTreeStore();
  const { save: saveHierarchy } = useSaveHierarchy();

  const save = useCallback(async (): Promise<boolean> => {
    // In-flight guard (same as useSaveHierarchy) — the Save button disables on
    // isSaving, but only after React re-renders; block the race window here.
    if (!selectedNodeId || useQuestionStore.getState().isSaving) return false;

    const { setIsDirty, setIsSaving, activeQuestion } = useQuestionStore.getState();
    const isExisting = activeQuestion?.identifier && !activeQuestion.identifier.startsWith('temp-');

    setIsSaving(true);
    try {
      const built = buildLiveQuestionMeta();
      if (!built) return false;
      const { questionName, questionMeta } = built;

      if (isExisting) {
        // ── Update existing question via hierarchy update ───────────────────
        // Old editor always sends full metadata in nodesModified for both new
        // and modified questions — same field set, isNew:false for existing.
        updateNode(selectedNodeId, { name: questionName, ...questionMeta });
        if (await saveHierarchy()) {
          notifySuccess(label('messages.success.013', 'Question saved'));
          setIsDirty(false);
          useEditorStore.getState().eventHandlers.onQuestionSaved?.({ identifier: selectedNodeId, ...questionMeta });
          return true;
        }
        return false;
      } else {
        // ── New question — build UUID, create via hierarchy ─────────────────
        const questionUuid = genUuid();
        // Replace temp- node with UUID, store full metadata, trigger hierarchy save
        replaceNodeId(selectedNodeId, questionUuid);
        updateNode(questionUuid, { name: questionName, ...questionMeta });
        if (await saveHierarchy()) {
          notifySuccess(label('messages.success.007', 'Question created'));
          setIsDirty(false);
          useEditorStore.getState().eventHandlers.onQuestionSaved?.({ identifier: questionUuid, ...questionMeta });
          return true;
        }
        return false;
      }
    } catch (e) {
      console.error('[useSaveQuestion] save failed:', e);
      notifyError(apiErrorMessage(e, label('messages.error.001', 'Failed to save question. Please try again.')));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [selectedNodeId, updateNode, replaceNodeId, saveHierarchy]);

  return { save };
}
