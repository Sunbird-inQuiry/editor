import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

let baseUrl = '';

export function setApiBaseUrl(url: string): void {
  baseUrl = url;
}

export const apiClient = axios.create({ timeout: 30000 });

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { useEditorStore } = await import('../store/editor.store');
  const state = useEditorStore.getState();
  const ctx = state.editorConfig?.context;

  config.headers = config.headers ?? {};

  if (ctx?.authToken) {
    config.headers['Authorization'] = `Bearer ${ctx.authToken}`;
  }
  if (ctx?.channel) {
    config.headers['X-Channel-Id'] = ctx.channel;
  }
  if (baseUrl) {
    config.baseURL = baseUrl;
  }

  return config;
});

export default apiClient;
