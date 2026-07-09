import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { apiClient, setApiBaseUrl, setApiSlug } from './client';
import { readQuestion, READ_QUESTION_FIELDS } from './question';

describe('readQuestion', () => {
  const captured: InternalAxiosRequestConfig[] = [];

  beforeEach(() => {
    setApiBaseUrl('');
    setApiSlug('/api');
    captured.length = 0;
    apiClient.defaults.adapter = async (config) => {
      captured.push(config);
      return {
        data: { responseCode: 'OK', result: { question: { identifier: 'do_q1' } } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse;
    };
  });

  afterEach(() => {
    apiClient.defaults.adapter = undefined;
  });

  it("requests the old editor's readQuestionFields plus isReviewModificationAllowed", async () => {
    const q = await readQuestion('do_q1');
    expect(q).toEqual({ identifier: 'do_q1' });
    const req = captured[0]!;
    expect(req.url).toBe('question/v2/read/do_q1');
    expect(req.params.fields).toBe(`${READ_QUESTION_FIELDS},isReviewModificationAllowed`);
    expect(READ_QUESTION_FIELDS).toContain('editorState');
    expect(READ_QUESTION_FIELDS).toContain('responseDeclaration');
    expect(READ_QUESTION_FIELDS).toContain('solutions');
    expect(READ_QUESTION_FIELDS).toContain('media');
  });

  it('appends leaf-form field codes like the old leafFormConfigFields', async () => {
    await readQuestion('do_q1', ['bloomsLevel', 'maxScore']);
    expect(captured[0]!.params.fields).toBe(
      `${READ_QUESTION_FIELDS},bloomsLevel,maxScore,isReviewModificationAllowed`,
    );
  });
});
