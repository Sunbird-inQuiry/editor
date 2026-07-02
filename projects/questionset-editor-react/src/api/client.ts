import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

let baseUrl = '';
let apiSlug = '/api';

export function setApiBaseUrl(url: string): void {
  baseUrl = url.replace(/\/+$/, '');
}

/**
 * Path prefix for all API calls, matching the old editor's
 * `config.apiSlug` (ApiConfigService). Default `/api`; the sunbird
 * portal host passes `/portal`.
 */
export function setApiSlug(slug: string): void {
  const trimmed = slug.trim().replace(/\/+$/, '');
  if (!trimmed) return;
  apiSlug = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function getApiSlug(): string {
  return apiSlug;
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

interface IApiEnvelope {
  responseCode?: string;
  params?: { errmsg?: string; err?: string };
  result?: unknown;
}

export const apiClient = axios.create({ timeout: 30000 });

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { useEditorStore } = await import('../store/editor.store');
  const ctx = useEditorStore.getState().editorConfig?.context;

  config.headers = config.headers ?? {};

  // Default headers matching the old editor's DataService.getHeader()
  config.headers['Accept'] = 'application/json';
  config.headers['X-Source'] = 'web';
  config.headers['ts'] = new Date().toISOString();
  config.headers['X-msgid'] = uuid();
  config.headers['X-Request-Id'] = uuid();

  if (ctx?.authToken) {
    config.headers['Authorization'] = `Bearer ${ctx.authToken}`;
  }
  if (ctx?.channel) {
    config.headers['X-Channel-Id'] = ctx.channel;
  }
  if (ctx?.did) {
    config.headers['X-Device-ID'] = ctx.did;
  }
  if (ctx?.pdata?.id) {
    config.headers['X-App-Id'] = ctx.pdata.id;
  }

  config.baseURL = `${baseUrl}${apiSlug}`;

  return config;
});

// Old editor's DataService rejected any response whose envelope is not
// responseCode === 'OK', surfacing params.errmsg. Replicate that here so
// every api module gets uniform error handling.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data as IApiEnvelope | undefined;
    if (
      data &&
      typeof data === 'object' &&
      data.responseCode !== undefined &&
      data.responseCode !== 'OK'
    ) {
      const message =
        data.params?.errmsg ?? data.params?.err ?? `API error: ${data.responseCode}`;
      const error = new Error(message) as Error & { response?: AxiosResponse };
      error.response = response;
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    const params = (error?.response?.data as IApiEnvelope | undefined)?.params;
    const message = params?.errmsg ?? params?.err;
    if (message && error instanceof Error) {
      error.message = message;
    }
    return Promise.reject(error);
  },
);

export default apiClient;
