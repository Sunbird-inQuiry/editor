import type { Plugin, Connect } from 'vite';
import type { ServerResponse } from 'http';
import {
  MOCK_QUESTIONSET_ID,
  MOCK_HIERARCHY,
  MOCK_CATEGORY_DEFINITION,
  MOCK_QUESTION_LIST,
  MOCK_QUESTION_READ,
  MOCK_FRAMEWORK,
  MOCK_CHANNEL,
} from './mock-data';
// convertLatex is dynamically imported inside the handler so the top-level
// module load doesn't trigger @jimp/core → file-type (ESM-only) during build.
type ConvertLatexFn = (eq: string) => Promise<{ data: string }>;
let _convertLatex: ConvertLatexFn | null = null;
async function getConvertLatex(): Promise<ConvertLatexFn> {
  if (!_convertLatex) {
    const mod = await import('../latexService.js') as { convertLatex: ConvertLatexFn };
    _convertLatex = mod.convertLatex;
  }
  return _convertLatex;
}

// Vite plugin that intercepts API calls in dev and returns mock responses.
// Skipped entirely when VITE_BASE_URL is set (real backend mode).
// Matchers are apiSlug-agnostic (paths are matched without the '/action' or
// '/api' prefix) — the editor prefixes requests with config.apiSlug.
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

        if (url.includes('/questionset/v2/hierarchy/update') && method === 'PATCH')
          return ok();

        if (url.includes('/questionset/v2/hierarchy/'))
          return json(MOCK_HIERARCHY);

        if (url.includes('/object/category/definition'))
          return json(MOCK_CATEGORY_DEFINITION);

        if (url.includes('/asset/v1/create') && method === 'POST')
          return json({ responseCode: 'OK', result: { identifier: `asset-${Date.now()}`, versionKey: '1' } });

        if (url.includes('/asset/v1/upload/'))
          return json({ responseCode: 'OK', result: { content_url: 'https://via.placeholder.com/400x300.png?text=Uploaded' } });

        if (url.includes('/content/v3/upload/url/'))
          return json({ responseCode: 'OK', result: { preSignedUrl: 'https://mock-storage.example.com/upload', url: 'https://mock-storage.example.com/asset' } });

        if (url.includes('/composite/v3/search') && method === 'POST')
          return json({ responseCode: 'OK', result: { count: 0, content: [], Question: [] } });

        if (url.includes('/question/v2/read/')) {
          const qid = url.split('/question/v2/read/')[1]?.split('?')[0] ?? '';
          const question = MOCK_QUESTION_READ[qid];
          return question
            ? json({ responseCode: 'OK', result: { question } })
            : json({ responseCode: 'RESOURCE_NOT_FOUND', params: { errmsg: `Question ${qid} not found` }, result: {} }, 404);
        }

        if (url.includes('/question/v2/list'))
          return json(MOCK_QUESTION_LIST);

        if (url.includes('/question/v2/create') && method === 'POST')
          return json({ responseCode: 'OK', result: { question: { identifier: `question-new-${Date.now()}`, name: 'New Question' } } });

        if (url.match(/\/question\/v2\/update\//) && method === 'PATCH')
          return ok();

        if (url.match(/\/questionset\/v[12]\/comment/))
          return method === 'GET'
            ? json({ responseCode: 'OK', result: { content: [] } })
            : ok();

        if (url.includes('/questionset/v2/review/') || url.includes('/questionset/v2/publish/') || url.includes('/questionset/v2/reject/'))
          return json({ responseCode: 'OK', result: { identifier: MOCK_QUESTIONSET_ID } });

        if (url.includes('/framework/v1/read/'))
          return json(MOCK_FRAMEWORK);

        if (url.includes('/channel/v1/read/'))
          return json(MOCK_CHANNEL);

        // LaTeX → PNG — same as editor/latexService.js (MathJax + svg2img)
        if (url.includes('/latex/convert')) {
          // equation can be in query string (GET) or request body (POST)
          const urlParams = new URL(url, 'http://localhost').searchParams;
          let equation = urlParams.get('equation') ?? '';

          const finish = () => {
            if (!equation) { res.writeHead(400); res.end('Bad Request'); return; }
            getConvertLatex()
              .then(fn => fn(equation))
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
