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
import { useQuestionStore } from '../store/question.store';
import { useEditorStore } from '../store/editor.store';
import { useTreeStore } from '../store/tree.store';
// updateQuestion (direct PATCH) no longer used — old editor creates/updates
// via hierarchy update for consistent full-metadata delivery.
import { useSaveHierarchy } from './useSaveHierarchy';
import { getUserId } from '../utils/context';
import { applyContentI18n } from '../utils/i18nSerialize';
import { PRIMARY_CATEGORY_MAP } from '../types/question';
import type { QuestionType, IOption, IMatchPair } from '../types/question';

// ---------------------------------------------------------------------------
// UUID generator
// ---------------------------------------------------------------------------
function genUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ---------------------------------------------------------------------------
// qType map  (old editor uses qType, not questionType)
// ---------------------------------------------------------------------------
const Q_TYPE: Record<QuestionType, string> = {
  mcq: 'MCQ', sa: 'SA', ftb: 'FTB', mtf: 'MTF', seq: 'SEQ', reo: 'REO',
};

const INTERACTION_TYPE: Partial<Record<QuestionType, string>> = {
  mcq: 'choice', ftb: 'text', mtf: 'match', seq: 'order', reo: 'order',
};

// ---------------------------------------------------------------------------
// body HTML — old editor wraps question in specific template divs
// ---------------------------------------------------------------------------
function parseBlanks(questionHtml: string): string[] {
  return [...questionHtml.matchAll(/\[\[(.+?)\]\]/g)].map((m) => m[1]!);
}

function buildBodyHtml(type: QuestionType, questionHtml: string): string {
  if (type === 'mcq') {
    return `<div class='question-body' tabindex='-1'><div class='mcq-title' tabindex='0'>${questionHtml}</div><div data-choice-interaction='response1' class='mcq-vertical'></div></div>`;
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
  return sentence.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean);
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
    // Old editor: one responseN per blank; every response carries the full
    // mapping of all blank values (score 1 each, caseSensitive false).
    const blanks = parseBlanks(questionBody);
    const mapping = blanks.map((b) => ({ value: b, score: 1, caseSensitive: false }));
    const rd: Record<string, unknown> = {};
    blanks.forEach((b, i) => {
      rd[`response${i + 1}`] = {
        cardinality: 'single',
        type: 'string',
        correctResponse: { value: b },
        mapping,
      };
    });
    if (blanks.length) return rd;
  }
  if (type === 'mcq') {
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
  if (type === 'mcq') {
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
  if (type === 'mcq') {
    const correct = options.find(o => o.isCorrect);
    return `<div class='answer-container'><div class='answer-body'>${correct?.body ?? ''}</div></div>`;
  }
  if (answerText) return `<div class='answer-container'><div class='answer-body'>${answerText}</div></div>`;
  return '';
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useSaveQuestion() {
  const {
    activeQuestion, questionType, questionBody, options, matchPairs, sequence,
    hints, hintText, solutionText, solutionType, solutionAsset, solutionUUID,
    answerText, sentence, difficultyLevel, bloomsLevel, maxScore,
    isPartialScore, evalUnordered,
    setIsDirty, setIsSaving,
  } = useQuestionStore();

  const config                                          = useEditorStore((s) => s.editorConfig);
  const { selectedNodeId, updateNode, replaceNodeId, treeData } = useTreeStore();
  const { save: saveHierarchy }                         = useSaveHierarchy();

  const save = useCallback(async (): Promise<boolean> => {
    if (!questionType || !selectedNodeId) return false;

    const channel         = config?.context?.channel   ?? '';
    const createdBy       = getUserId(config?.context);
    const framework       = config?.context?.framework ?? '';
    const primaryCategory = PRIMARY_CATEGORY_MAP[questionType] ?? 'Multiple Choice Question';

    // Details-form values (childMetadata: name/Marks/…) live in treeCache —
    // they take precedence over auto-derived values, like the old editor.
    const formMeta = (useTreeStore.getState().treeCache[selectedNodeId] ?? {}) as Record<string, unknown>;
    const formName = typeof formMeta.name === 'string' && formMeta.name.trim() ? formMeta.name.trim() : undefined;
    const formMarks = Number(formMeta.maxScore);

    const questionName = formName
      ?? ((questionBody || '').replace(/<[^>]+>/g, '').slice(0, 60).trim() || 'Untitled Question');

    // FTB scores 1 per blank, MTF 1 per pair (when partial); otherwise Marks
    // from the details form.
    const blankCount =
      questionType === 'ftb' ? parseBlanks(questionBody).length :
      questionType === 'mtf' ? matchPairs.length : 0;
    const effectiveMaxScore =
      questionType === 'ftb' && blankCount > 0 ? blankCount :
      questionType === 'mtf' ? (isPartialScore && blankCount > 0 ? blankCount : 1) :
      questionType === 'seq' ? (isPartialScore && sequence.length > 0 ? sequence.length : 1) :
      questionType === 'reo' ? 1 :
      (Number.isFinite(formMarks) && formMarks > 0 ? formMarks : (maxScore ?? 1));

    const hasInteractions = ['mcq', 'ftb', 'mtf', 'seq', 'reo'].includes(questionType);

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
    // {uuid: rendered html}. Asset + thumbnail entries join media[].
    const solutionId = solutionUUID || genUuid();
    let editorStateSolutions: Array<Record<string, unknown>> | undefined;
    let metadataSolutions: Record<string, unknown> = {};
    if (solutionType === 'html' && solutionText.trim()) {
      editorStateSolutions = [{ id: solutionId, value: { en: { type: 'html', value: solutionText } } }];
      metadataSolutions = { [solutionId]: solutionText };
    } else if ((solutionType === 'video' || solutionType === 'audio') && solutionAsset) {
      editorStateSolutions = [{ id: solutionId, value: { en: { type: solutionType, value: solutionAsset.id } } }];
      metadataSolutions = { [solutionId]: assetSolutionHtml(solutionType, solutionAsset) };
      if (!questionMedia.some((m) => m.id === solutionAsset.id)) {
        questionMedia.push({
          id: solutionAsset.id, src: solutionAsset.src, type: solutionType,
          assetId: solutionAsset.id, name: solutionAsset.name, baseUrl: mediaBaseUrl,
          ...(solutionAsset.thumbnail ? { thumbnail: solutionAsset.thumbnail } : {}),
        });
      }
      if (solutionAsset.thumbnail) {
        const thumbId = `${solutionType}_${solutionAsset.id}`;
        if (!questionMedia.some((m) => m.id === thumbId)) {
          questionMedia.push({ id: thumbId, src: solutionAsset.thumbnail, type: 'image', baseUrl: mediaBaseUrl });
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

    // Taxonomy copied from root questionset — old editor includes these on every question
    const rootMeta = (treeData[0]?.metadata ?? {}) as Record<string, unknown>;
    const taxonomy: Record<string, unknown> = {};
    (['audience', 'board', 'medium', 'gradeLevel', 'subject', 'license'] as const)
      .forEach(k => { if (rootMeta[k]) taxonomy[k] = rootMeta[k]; });
    // Old editor: channel read supplies the default license when unset.
    if (!taxonomy.license) {
      const defaultLicense = useEditorStore.getState().channelData?.defaultLicense;
      if (typeof defaultLicense === 'string' && defaultLicense) taxonomy.license = defaultLicense;
    }

    setIsSaving(true);
    try {
      const isExisting = activeQuestion?.identifier && !activeQuestion.identifier.startsWith('temp-');

      if (isExisting) {
        // ── Update existing question via hierarchy update ───────────────────
        // Old editor always sends full metadata in nodesModified for both new
        // and modified questions — same field set, isNew:false for existing.
        const questionMeta: Record<string, unknown> = {
          mimeType:    'application/vnd.sunbird.question',
          media:       questionMedia,
          editorState: {
            ...buildEditorState(questionType, questionBody, options, answerText, { isPartialScore, evalUnordered }, matchPairs, sequence, sentence),
            ...(editorStateSolutions ? { solutions: editorStateSolutions } : {}),
            ...(Object.keys(metadataHints).length ? { hints: metadataHints } : {}),
          },
          body:        buildBodyHtml(questionType, questionBody),
          answer:      buildAnswerHtml(questionType, options, answerText),
          ...(questionType === 'mcq' ? { templateId: 'mcq-vertical' } : {}),
          ...(questionType === 'ftb' ? {
            isPartialScore,
            evalUnordered,
            scoringMode: 'responseProcessing',
            responseProcessing: { template: 'MAP_RESPONSE' },
          } : {}),
          ...(questionType === 'mtf' ? {
            pairs: wrapPairs(matchPairs),
            isPartialScore,
            scoringMode: 'responseProcessing',
            responseProcessing: { template: 'MAP_RESPONSE' },
          } : {}),
          ...(questionType === 'seq' ? {
            correctOrder: seqOrder(sequence),
            templateId: 'seq-vertical',
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
          qType:       Q_TYPE[questionType] ?? 'MCQ',
          primaryCategory,
          // Old editor sends interaction fields only for interactive types —
          // SA payloads carry just interactions:{} (no interactionTypes/
          // responseDeclaration/hints keys).
          ...(hasInteractions ? {
            interactionTypes: [INTERACTION_TYPE[questionType] ?? 'text'],
            responseDeclaration: buildResponseDeclaration(questionType, options, questionBody, matchPairs, isPartialScore, sequence, sentence),
          } : {}),
          // Old MTF/SEQ payloads carry no hints key unless a hint is set.
          // hints key only when a hint actually exists — no empty {} with a
          // dangling outcomeDeclaration.hint reference.
          ...(Object.keys(metadataHints).length ? { hints: metadataHints } : {}),
          interactions: buildInteractions(questionType, options, questionBody, matchPairs, sequence, sentence),
          outcomeDeclaration: {
            maxScore: {
              cardinality: blankCount > 1 ? 'multiple' : 'single',
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
          solutionType,
          buildBodyHtml,
          answerWrap,
        });

        updateNode(selectedNodeId, { name: questionName, ...questionMeta });
        if (await saveHierarchy()) {
          notifySuccess('Question saved');
          useEditorStore.getState().eventHandlers.onQuestionSaved?.({ identifier: selectedNodeId, ...questionMeta });
          return true;
        }
        return false;
      } else {
        // ── New question — build UUID + full metadata, create via hierarchy ──
        const questionUuid = genUuid();

        const questionMeta: Record<string, unknown> = {
          mimeType:    'application/vnd.sunbird.question',
          media:       questionMedia,
          editorState: {
            ...buildEditorState(questionType, questionBody, options, answerText, { isPartialScore, evalUnordered }, matchPairs, sequence, sentence),
            ...(editorStateSolutions ? { solutions: editorStateSolutions } : {}),
            ...(Object.keys(metadataHints).length ? { hints: metadataHints } : {}),
          },
          body:        buildBodyHtml(questionType, questionBody),
          answer:      buildAnswerHtml(questionType, options, answerText),
          ...(questionType === 'mcq' ? { templateId: 'mcq-vertical' } : {}),
          ...(questionType === 'ftb' ? {
            isPartialScore,
            evalUnordered,
            scoringMode: 'responseProcessing',
            responseProcessing: { template: 'MAP_RESPONSE' },
          } : {}),
          ...(questionType === 'mtf' ? {
            pairs: wrapPairs(matchPairs),
            isPartialScore,
            scoringMode: 'responseProcessing',
            responseProcessing: { template: 'MAP_RESPONSE' },
          } : {}),
          ...(questionType === 'seq' ? {
            correctOrder: seqOrder(sequence),
            templateId: 'seq-vertical',
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
          qType:       Q_TYPE[questionType] ?? 'MCQ',
          primaryCategory,
          // Old editor sends interaction fields only for interactive types —
          // SA payloads carry just interactions:{} (no interactionTypes/
          // responseDeclaration/hints keys).
          ...(hasInteractions ? {
            interactionTypes: [INTERACTION_TYPE[questionType] ?? 'text'],
            responseDeclaration: buildResponseDeclaration(questionType, options, questionBody, matchPairs, isPartialScore, sequence, sentence),
          } : {}),
          // Old MTF/SEQ payloads carry no hints key unless a hint is set.
          // hints key only when a hint actually exists — no empty {} with a
          // dangling outcomeDeclaration.hint reference.
          ...(Object.keys(metadataHints).length ? { hints: metadataHints } : {}),
          interactions: buildInteractions(questionType, options, questionBody, matchPairs, sequence, sentence),
          outcomeDeclaration: {
            maxScore: {
              cardinality: blankCount > 1 ? 'multiple' : 'single',
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
          solutionType,
          buildBodyHtml,
          answerWrap,
        });

        // Replace temp- node with UUID, store full metadata, trigger hierarchy save
        replaceNodeId(selectedNodeId, questionUuid);
        updateNode(questionUuid, { name: questionName, ...questionMeta });
        if (await saveHierarchy()) {
          notifySuccess('Question created');
          useEditorStore.getState().eventHandlers.onQuestionSaved?.({ identifier: questionUuid, ...questionMeta });
          return true;
        }
        return false;
      }
    } catch (e) {
      console.error('[useSaveQuestion] save failed:', e);
      notifyError(apiErrorMessage(e, 'Failed to save question. Please try again.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    activeQuestion, questionType, questionBody, options, matchPairs, sequence,
    solutionText, solutionType, solutionAsset, solutionUUID,
    answerText, sentence, hints, hintText, difficultyLevel, bloomsLevel, maxScore,
    isPartialScore, evalUnordered,
    config, selectedNodeId, updateNode, replaceNodeId, treeData, saveHierarchy,
    setIsDirty, setIsSaving,
  ]);

  return { save };
}
