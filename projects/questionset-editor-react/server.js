/**
 * Standalone development / local-test server for the React QuestionSet Editor.
 *
 * Mirrors editor/server.js for the old Angular editor, adapted for the
 * React web component.
 *
 * Responsibilities:
 *   1. Serve built dist/ as static assets (web component JS, CSS, math libs)
 *   2. Expose GET + POST /latex/convert for the equation editor iframe
 *   3. Proxy /action/*, /api/*, /assets/* to BASE_URL (Sunbird backend)
 *
 * Usage:
 *   node server.js
 *
 * Environment variables (copy .env.example → .env and fill in):
 *   BASE_URL    Sunbird backend hostname  (e.g. dev.sunbirded.org)
 *   AUTH_TOKEN  Bearer token for API calls
 *   USER_TOKEN  x-authenticated-user-token for API calls
 *   PORT        HTTP port to listen on    (default: 9001)
 */

import express        from 'express';
import http           from 'http';
import bodyParser     from 'body-parser';
import proxy          from 'express-http-proxy';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv         from 'dotenv';
import { convert }    from './latexService.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL   = (process.env.BASE_URL   || 'test.sunbirded.org').replace(/^https?:\/\//, '');
const AUTH_TOKEN = process.env.AUTH_TOKEN  || '';
const USER_TOKEN = process.env.USER_TOKEN  || '';
const PORT       = parseInt(process.env.PORT   || '9001', 10);

const app = express();
app.set('port', PORT);
app.use(express.json());

// ── LaTeX → PNG ──────────────────────────────────────────────────────────────

app.get('/latex/convert', convert);
app.post('/latex/convert', bodyParser.json({ limit: '1mb' }), convert);

// ── Static assets ─────────────────────────────────────────────────────────────
// Serve built web component assets from dist/ (JS, CSS, ckeditor, fonts…).
// Do NOT serve the project root — index.html there is the Vite dev entry and
// references .tsx files that Express cannot compile.
app.use(express.static(join(__dirname, 'dist')));
app.use(express.static(join(__dirname, 'public')));

// ── Test-harness page ─────────────────────────────────────────────────────────
// Dynamically rendered so env vars (CONTENT_ID, CHANNEL, …) are injected at
// request time — same idea as Vite's __EDITOR_ENV__ injection at dev-start.
app.get(['/', '/index.html'], (req, res) => {
  const contentId = process.env.CONTENT_ID || '';
  const channel   = process.env.CHANNEL    || '';
  const framework = process.env.FRAMEWORK  || 'NCF';
  const mode      = process.env.MODE       || 'edit';

  const context = JSON.stringify({
    authToken:  '',
    userId:     'user-001',
    channel,
    pdata:      { id: 'sunbird.portal', ver: '1.0' },
    env:        'questionset_editor',
    contentId,
    identifier: contentId,
    framework,
  });

  const config = JSON.stringify({
    mode,
    objectType:      'QuestionSet',
    primaryCategory: 'Practice Question Set',
    maxDepth:        3,
  });

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QuML Editor – Standalone</title>

  <!-- Resolve React/ReactDOM peer-deps that are external in the dist bundle -->
  <script type="importmap">
  {
    "imports": {
      "react":             "https://esm.sh/react@19.2.7",
      "react/jsx-runtime": "https://esm.sh/react@19.2.7/jsx-runtime",
      "react-dom":         "https://esm.sh/react-dom@19.2.7",
      "react-dom/client":  "https://esm.sh/react-dom@19.2.7/client"
    }
  }
  <\/script>

  <link rel="stylesheet" href="/style.css" />
  <!-- CKEditor must be on window before the WC initialises -->
  <script src="/ckeditor/ckeditor.js"><\/script>

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { height: 100vh; overflow: hidden; }
    sb-questionset-editor { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <sb-questionset-editor id="editor"></sb-questionset-editor>

  <script type="module">
    import { registerQuestionsetEditor } from '/index.js';
    registerQuestionsetEditor();

    const editor = document.getElementById('editor');
    editor.setAttribute('context', ${JSON.stringify(context)});
    editor.setAttribute('config',  ${JSON.stringify(config)});
  <\/script>
</body>
</html>`);
});

// ── Proxy helpers ─────────────────────────────────────────────────────────────

function decorateHeaders(proxyReqOpts) {
  if (AUTH_TOKEN) proxyReqOpts.headers['authorization']              = `Bearer ${AUTH_TOKEN}`;
  if (USER_TOKEN) proxyReqOpts.headers['x-authenticated-user-token'] = USER_TOKEN;
  return proxyReqOpts;
}

/**
 * Create an express-http-proxy middleware.
 * @param {((url: string) => string) | null} rewrite  Optional path-rewrite fn.
 * @param {boolean} streamBody  Set true for multipart/binary uploads.
 */
function makeProxy(rewrite, streamBody = false) {
  return proxy(BASE_URL, {
    https: true,
    limit: '30mb',
    parseReqBody: !streamBody,
    proxyReqPathResolver(req) {
      const url = rewrite ? rewrite(req.originalUrl) : req.originalUrl;
      console.log('[proxy]', req.method, req.originalUrl, '→', url);
      return url;
    },
    proxyReqOptDecorator: decorateHeaders,
  });
}

// Path-rewrite shortcuts
const action  = (url) => url.replace('/action/', '/api/');
const compose = (url) => url.replace('/action/composite/v3/', '/api/composite/v1/');

// ── API proxy routes (order matters — most-specific first) ───────────────────

// Multipart asset upload — stream body through without buffering
app.post('/action/asset/v1/upload/*', makeProxy(action, true));

// QuestionSet + Question (support both v1 and v2 endpoints)
app.use(
  [
    '/action/questionset/v1/*',
    '/action/questionset/v2/*',
    '/action/question/v1/*',
    '/action/question/v2/*',
    '/action/object/category/definition/*',
    '/action/asset/v1/create',
    '/action/content/v3/upload/url/*',
    '/action/content/v3/*',
  ],
  makeProxy(action),
);

// Composite search  (/action/composite/v3/ → /api/composite/v1/ on backend)
app.use('/action/composite/v3/*', makeProxy(compose));

// Framework + channel  (no path rewrite)
app.use(
  ['/api/framework/v1/*', '/api/channel/v1/*', '/learner/framework/v1/*'],
  makeProxy(null),
);

// Blob-storage assets served through portal proxy
app.use('/assets/public/*', makeProxy(null));

// Catch-all for any remaining /action and /api paths
app.use(['/action', '/api'], makeProxy(action));

// ── Start ─────────────────────────────────────────────────────────────────────

http.createServer(app).listen(PORT, () => {
  console.log(`\n[react-editor] server → http://localhost:${PORT}`);
  console.log(`[react-editor] backend → ${BASE_URL}`);
  console.log(`[react-editor] open   → http://localhost:${PORT}/index.html\n`);
});
