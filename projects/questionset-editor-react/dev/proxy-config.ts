import { resolve } from 'path';
import { existsSync } from 'fs';

// Builds the Vite server.proxy config.
//
// Real mode  (VITE_BASE_URL set): proxies all /action/* and /api/* to the
//   actual Sunbird backend with auth headers — mirrors the old server.js.
//
// Mock/portal mode (default): proxies to the portal backend on localhost:3000.
//   The mock-api-plugin answers matching routes first; only unmatched requests
//   reach this proxy.
export function buildProxyConfig() {
  const baseUrl   = process.env.BASE_URL;
  const authToken = process.env.AUTH_TOKEN ?? '';
  const userToken = process.env.USER_TOKEN ?? '';

  if (baseUrl) {
    const target = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    const addAuthHeaders = (proxyReq: import('http').ClientRequest) => {
      if (authToken) proxyReq.setHeader('authorization', `Bearer ${authToken}`);
      if (userToken) proxyReq.setHeader('x-authenticated-user-token', userToken);
    };

    const to = (rewrite?: (p: string) => string) => ({
      target,
      changeOrigin: true,
      secure: false,
      ...(rewrite ? { rewrite } : {}),
      configure: (proxy: import('http-proxy').Server) => {
        proxy.on('proxyReq', addAuthHeaders);
      },
    });

    const action  = (p: string) => p.replace('/action/', '/api/');
    const compose = (p: string) => p.replace('/action/composite/v3/', '/api/composite/v1/');

    return {
      '/latex':                  to(),              // LaTeX→PNG used by equation editor
      '/action/asset/v1/upload': to(action),
      '/action/questionset':     to(action),
      '/action/question':        to(action),
      '/action/object/category': to(action),
      '/action/composite':       to(compose),
      '/action/program':         to(action),
      '/action':                 to(action),
      '/api/framework':          to(),
      '/api/channel':            to(),
      '/api':                    to(),
      '/assets/public':          to(),
      '/learner':                to(),
    };
  }

  // Portal / mock mode
  return {
    '/action':  { target: 'http://localhost:3000', changeOrigin: true },
    '/api':     { target: 'http://localhost:3000', changeOrigin: true },
    '/assets':  {
      target: 'http://localhost:3000',
      changeOrigin: true,
      bypass: (req: import('http').IncomingMessage) => {
        const url = ((req as { url?: string }).url ?? '').split('?')[0];
        if (existsSync(resolve(__dirname, '..', 'public' + url))) return url;
        return undefined;
      },
    },
    '/learner': { target: 'http://localhost:3000', changeOrigin: true },
  };
}
