import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { apiClient, setApiBaseUrl, setApiSlug, getApiSlug } from './client';
import { useEditorStore } from '../store/editor.store';
import type { IEditorConfig } from '../types/editor';

const EDITOR_CONFIG: IEditorConfig = {
  context: {
    identifier: 'do_123',
    channel: 'test-channel',
    sid: 'sid-1',
    did: 'did-1',
    authToken: 'token-abc',
    pdata: { id: 'test.portal', ver: '1.0' },
    user: { id: 'user-1' },
  },
  config: { mode: 'edit', objectType: 'QuestionSet', apiSlug: '/portal' },
};

function stubAdapter(
  data: unknown,
): { requests: InternalAxiosRequestConfig[] } {
  const captured = { requests: [] as InternalAxiosRequestConfig[] };
  apiClient.defaults.adapter = async (config) => {
    captured.requests.push(config);
    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as AxiosResponse;
  };
  return captured;
}

describe('apiClient', () => {
  beforeEach(() => {
    setApiBaseUrl('');
    setApiSlug('/api');
    useEditorStore.setState({ editorConfig: EDITOR_CONFIG });
  });

  afterEach(() => {
    apiClient.defaults.adapter = undefined;
    useEditorStore.setState({ editorConfig: null });
  });

  it('prefixes relative endpoints with the apiSlug (old editor contract)', async () => {
    setApiSlug('/portal');
    const captured = stubAdapter({ responseCode: 'OK', result: {} });
    await apiClient.get('questionset/v2/read/do_123');
    const req = captured.requests[0]!;
    expect(req.baseURL).toBe('/portal');
    expect(req.url).toBe('questionset/v2/read/do_123');
  });

  it('normalizes the slug (adds leading slash, strips trailing)', () => {
    setApiSlug('portal/');
    expect(getApiSlug()).toBe('/portal');
    setApiSlug('');
    expect(getApiSlug()).toBe('/portal'); // empty slug ignored
  });

  it('combines apiBaseUrl and apiSlug', async () => {
    setApiBaseUrl('https://example.com/');
    setApiSlug('/action');
    const captured = stubAdapter({ responseCode: 'OK', result: {} });
    await apiClient.get('channel/v1/read/ch1');
    expect(captured.requests[0]!.baseURL).toBe('https://example.com/action');
  });

  it("sends the old editor's default headers", async () => {
    const captured = stubAdapter({ responseCode: 'OK', result: {} });
    await apiClient.get('framework/v1/read/NCF');
    const headers = captured.requests[0]!.headers;
    expect(headers['Accept']).toBe('application/json');
    expect(headers['X-Source']).toBe('web');
    expect(headers['ts']).toBeTruthy();
    expect(headers['X-msgid']).toBeTruthy();
    expect(headers['X-Request-Id']).toBeTruthy();
    expect(headers['X-Channel-Id']).toBe('test-channel');
    expect(headers['X-Device-ID']).toBe('did-1');
    expect(headers['X-App-Id']).toBe('test.portal');
    expect(headers['Authorization']).toBe('Bearer token-abc');
  });

  it('omits Authorization when no authToken in context', async () => {
    useEditorStore.setState({
      editorConfig: {
        ...EDITOR_CONFIG,
        context: { ...EDITOR_CONFIG.context, authToken: undefined },
      },
    });
    const captured = stubAdapter({ responseCode: 'OK', result: {} });
    await apiClient.get('framework/v1/read/NCF');
    expect(captured.requests[0]!.headers['Authorization']).toBeUndefined();
  });

  it('rejects when the envelope responseCode is not OK', async () => {
    stubAdapter({
      responseCode: 'CLIENT_ERROR',
      params: { errmsg: 'Validation failed for questionset' },
      result: {},
    });
    await expect(apiClient.get('questionset/v2/read/do_bad')).rejects.toThrow(
      'Validation failed for questionset',
    );
  });

  it('passes through responses without an envelope (e.g. blob endpoints)', async () => {
    stubAdapter({ some: 'raw-data' });
    const res = await apiClient.get('whatever');
    expect(res.data).toEqual({ some: 'raw-data' });
  });
});
