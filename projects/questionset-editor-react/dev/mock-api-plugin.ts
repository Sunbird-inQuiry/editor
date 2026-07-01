import type { Plugin, Connect } from 'vite';
import type { ServerResponse } from 'http';
import {
  MOCK_QUESTIONSET_ID,
  MOCK_HIERARCHY,
  MOCK_CATEGORY_DEFINITION,
  MOCK_QUESTION_LIST,
  MOCK_FRAMEWORK,
  MOCK_CHANNEL,
} from './mock-data';
import { convertLatex } from './latex-service';

// Vite plugin that intercepts API calls in dev and returns mock responses.
// Skipped entirely when VITE_BASE_URL is set (real backend mode).
export function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use((req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        // Real backend mode — let the proxy handle everything
        if (process.env.BASE_URL) return next();

        const url = req.url ?? '';
        const method = req.method ?? 'GET';

        function json(data: unknown, status = 200) {
          res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify(data));
        }

        function ok() { return json({ responseCode: 'OK', result: {} }); }

        if (url.includes('/action/questionset/v2/hierarchy/update') && method === 'PATCH')
          return ok();

        if (url.includes('/action/questionset/v2/hierarchy/'))
          return json(MOCK_HIERARCHY);

        if (url.includes('/action/object/category/definition') || url.includes('/object/category/definition'))
          return json(MOCK_CATEGORY_DEFINITION);

        if (url.includes('/action/asset/v1/create') && method === 'POST')
          return json({ responseCode: 'OK', result: { identifier: `asset-${Date.now()}`, versionKey: '1' } });

        if (url.includes('/action/asset/v1/upload/'))
          return json({ responseCode: 'OK', result: { content_url: 'https://via.placeholder.com/400x300.png?text=Uploaded' } });

        if (url.includes('/action/content/v3/upload/url/'))
          return json({ responseCode: 'OK', result: { preSignedUrl: 'https://mock-storage.example.com/upload', url: 'https://mock-storage.example.com/asset' } });

        if (url.includes('/action/composite/v3/search') && method === 'POST')
          return json({ responseCode: 'OK', result: { count: 0, content: [] } });

        if (url.includes('/action/question/v2/list'))
          return json(MOCK_QUESTION_LIST);

        if (url.includes('/action/question/v2/create') && method === 'POST')
          return json({ responseCode: 'OK', result: { question: { identifier: `question-new-${Date.now()}`, name: 'New Question' } } });

        if (url.match(/\/action\/question\/v2\/update\//) && method === 'PATCH')
          return ok();

        if (url.includes('/action/questionset/v2/comment/'))
          return method === 'GET'
            ? json({ responseCode: 'OK', result: { content: [] } })
            : ok();

        if (url.includes('/action/questionset/v2/review/') || url.includes('/action/questionset/v2/publish/') || url.includes('/action/questionset/v2/reject/'))
          return json({ responseCode: 'OK', result: { identifier: MOCK_QUESTIONSET_ID } });

        if (url.includes('/api/framework/v1/read/'))
          return json(MOCK_FRAMEWORK);

        if (url.includes('/api/channel/v1/read/'))
          return json(MOCK_CHANNEL);

        // LaTeX → PNG — same as editor/latexService.js (MathJax + svg2img)
        if (url.includes('/latex/convert')) {
          // equation can be in query string (GET) or request body (POST)
          const urlParams = new URL(url, 'http://localhost').searchParams;
          let equation = urlParams.get('equation') ?? '';

          const finish = () => {
            if (!equation) { res.writeHead(400); res.end('Bad Request'); return; }
            convertLatex(equation)
              .then(result => json(result))
              .catch(() => json({ data: '' }));
          };

          if (!equation && method === 'POST') {
            let body = '';
            req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
            req.on('end', () => {
              try { equation = JSON.parse(body).equation ?? ''; } catch {
                equation = new URLSearchParams(body).get('equation') ?? '';
              }
              finish();
            });
          } else {
            finish();
          }
          return;
        }

        next();
      });
    },
  };
}
