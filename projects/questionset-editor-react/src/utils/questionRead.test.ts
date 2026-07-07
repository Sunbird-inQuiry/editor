import { describe, it, expect } from 'vitest';
import { normalizeQuestionRead, deriveQuestionType, normalizeOptions } from './questionRead';

// An old-editor-persisted MCQ, as question/v2/read returns it.
const OLD_MCQ = {
  identifier: 'do_q1',
  name: 'What is 2 + 2?',
  primaryCategory: 'Multiple Choice Question',
  qType: 'MCQ',
  interactionTypes: ['choice'],
  body: "<div class='question-body'><div class='mcq-title'><p>What is 2 + 2?</p></div></div>",
  editorState: {
    question: '<p>What is 2 + 2?</p>',
    options: [
      { answer: false, value: { body: '<p>3</p>', value: 0 } },
      { answer: true, value: { body: '<p>4</p>', value: 1 } },
    ],
  },
  responseDeclaration: {
    response1: { cardinality: 'single', type: 'integer', correctResponse: { value: 1 }, mapping: [{ value: 1, score: 1 }] },
  },
  outcomeDeclaration: { maxScore: { cardinality: 'single', type: 'integer', defaultValue: 3 } },
  solutions: [{ id: 'sol-1', type: 'html', value: '<p>2 + 2 = 4</p>' }],
  media: [{ id: 'm1', type: 'image', src: '/x.png' }],
  isPartialScore: true,
};

describe('normalizeQuestionRead (old editor read → store shape)', () => {
  it('maps an old-editor MCQ: type, options, correct answer, body', () => {
    const q = normalizeQuestionRead(OLD_MCQ);
    expect(q.questionType).toBe('mcq');
    expect(q.options).toHaveLength(2);
    expect(q.options![0]).toMatchObject({ body: '<p>3</p>', isCorrect: false });
    expect(q.options![1]).toMatchObject({ body: '<p>4</p>', isCorrect: true });
    expect(q.editorState?.question).toBe('<p>What is 2 + 2?</p>');
  });

  it('keeps solutions, media, maxScore and raw flags for round-trip', () => {
    const q = normalizeQuestionRead(OLD_MCQ);
    expect(q.solutions?.[0]).toMatchObject({ id: 'sol-1', type: 'html', value: '<p>2 + 2 = 4</p>' });
    expect(q.media).toHaveLength(1);
    expect(q.maxScore).toBe(3);
    expect(q.isPartialScore).toBe(true);
    expect(q.responseDeclaration).toBeDefined();
    expect(q.interactionTypes).toEqual(['choice']);
  });

  it('marks the correct option from responseDeclaration when answer flags are absent', () => {
    const options = normalizeOptions(
      [
        { value: { body: 'a', value: 0 } },
        { value: { body: 'b', value: 1 } },
      ],
      1,
    );
    expect(options![0]!.isCorrect).toBe(false);
    expect(options![1]!.isCorrect).toBe(true);
  });

  it('passes through new-editor option shape unchanged', () => {
    const options = normalizeOptions([{ id: 'x', body: 'A', isCorrect: true }], undefined);
    expect(options![0]).toMatchObject({ id: 'x', body: 'A', isCorrect: true });
  });

  it('derives type from qType, then primaryCategory, then interactionTypes', () => {
    expect(deriveQuestionType({ qType: 'FTB' })).toBe('ftb');
    expect(deriveQuestionType({ qType: 'VSA' })).toBe('sa');
    expect(deriveQuestionType({ primaryCategory: 'Match The Following' })).toBe('mtf');
    expect(deriveQuestionType({ interactionTypes: ['choice'] })).toBe('mcq');
    expect(deriveQuestionType({ body: '<p>x</p>' })).toBe('sa');
    expect(deriveQuestionType({})).toBeUndefined();
  });

  it('normalizes uuid-keyed hint maps (old editor) and hint arrays', () => {
    const fromMap = normalizeQuestionRead({ ...OLD_MCQ, hints: { 'uuid-1': { body: 'hint one' } } });
    expect(fromMap.hints).toEqual([{ id: 'uuid-1', body: 'hint one' }]);
    const fromArray = normalizeQuestionRead({ ...OLD_MCQ, hints: [{ id: 'h1', body: 'b' }] });
    expect(fromArray.hints).toEqual([{ id: 'h1', body: 'b' }]);
  });

  it('falls back to editorState.solutions when solutions is empty', () => {
    const q = normalizeQuestionRead({
      ...OLD_MCQ,
      solutions: [],
      editorState: { ...OLD_MCQ.editorState, solutions: [{ id: 's', type: 'html', value: 'from-editor-state' }] },
    });
    expect(q.solutions?.[0]?.value).toBe('from-editor-state');
  });
});
