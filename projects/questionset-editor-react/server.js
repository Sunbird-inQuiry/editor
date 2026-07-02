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

// Match Vite's env-file precedence: .env.local overrides .env.
// dotenv won't override variables already set, so the first call wins.
dotenv.config({ path: '.env.local' });
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

// Return 204 for font requests that have no local copy rather than proxying
// them to BASE_URL (which returns an HTML error page that OTS rejects).
app.use('/assets/fonts/', (req, res) => res.status(204).end());

// ── Test-harness page ─────────────────────────────────────────────────────────
// Dynamically rendered so env vars (CONTENT_ID, CHANNEL, …) are injected at
// request time — same idea as Vite's __EDITOR_ENV__ injection at dev-start.
// Also serve the test harness at the same path the old Angular editor used,
// so existing bookmarks / scripts keep working.
app.get([
  '/',
  '/index.html',
  '/web-component/assets/quml-editor/',
  '/web-component/assets/quml-editor/index.html',
], (req, res) => {
  const contentId = process.env.CONTENT_ID || '';
  const channel   = process.env.CHANNEL    || '';
  const framework = process.env.FRAMEWORK  || 'NCF';
  const mode      = process.env.MODE       || 'edit';
  const userId    = process.env.USER_ID    || 'user-001';

  const context = JSON.stringify({
    authToken:  '',
    userId,
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

  <!-- Plus Jakarta Sans — same font the web component injects into shadow DOM -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />

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
  <div id="root" style="width:100%;height:100%;"></div>

  <script type="module">
    import { registerQuestionsetEditor } from '/index.js';
    registerQuestionsetEditor();

    // Set props as element PROPERTIES (not string attributes) so React
    // receives parsed objects on the very first render.
    // JSON is valid JS object-literal syntax, so this works without JSON.parse.
    const editor = document.createElement('sb-questionset-editor');
    editor.context = ${context};
    editor.config  = ${config};
    editor.style.cssText = 'display:block;width:100%;height:100%;';
    document.getElementById('root').appendChild(editor);
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

// Extract path+query from a URL string (equivalent to urlHelper.parse(url).path)
function parsePath(url) {
  try { return new URL(url, 'http://x').pathname + (new URL(url, 'http://x').search || ''); }
  catch { return url; }
}

// ── API proxy routes — same structure as editor/server.js ────────────────────

// Asset upload — no body buffering (multipart stream)
app.post(['/action/asset/v1/upload/*'], proxy(BASE_URL, {
  https: true,
  parseReqBody: false,
  proxyReqPathResolver(req) {
    const url = req.originalUrl.replace('/action/', '/api/');
    console.log('[proxy]', req.method, req.originalUrl, '→', url);
    return parsePath(url);
  },
  proxyReqOptDecorator: decorateHeaders,
}));

// Framework reads — public API, proxy to BASE_URL (no auth required)
app.get(['/api/framework/v1/read/*', '/learner/framework/v1/read/*'], proxy(BASE_URL, {
  https: true,
  proxyReqPathResolver(req) {
    console.log('[proxy]', req.method, req.url);
    return parsePath(req.url);
  },
  proxyReqOptDecorator: decorateHeaders,
}));

// Channel reads (no path rewrite)
app.get(['/api/channel/v1/read/*'], proxy(BASE_URL, {
  https: true,
  proxyReqPathResolver(req) {
    console.log('[proxy]', req.method, req.url);
    return parsePath(req.url);
  },
  proxyReqOptDecorator: decorateHeaders,
}));

// QuestionSet + Question (v2) + category definition
// Local: questionset/v2 → questionset/v5 (KP service on localhost:9000)
app.use([
  '/action/questionset/v2/*',
  '/action/question/v2/*',
  '/action/object/category/definition/v1/*',
  '/api/question/v2/*',
], proxy('localhost:9000', {
  https: false,
  limit: '30mb',
  proxyReqPathResolver(req) {
    const url = req.originalUrl
      .replace('/action/questionset/v2/', '/questionset/v5/')
      .replace('/action/question/v2/', '/question/v5/')
      .replace('/action/object/category/definition/v1/', '/object/category/definition/v4/')
      .replace('/action/', '/');
    console.log('[proxy]', req.method, req.originalUrl, '→', url);
    return parsePath(url);
  },
  proxyReqOptDecorator: decorateHeaders,
}));

// Composite search (v3 path → v1 on backend)
app.use(['/action/composite/v3/search'], proxy(BASE_URL, {
  https: true,
  limit: '30mb',
  proxyReqPathResolver(req) {
    const url = req.originalUrl.replace('/action/composite/v3/', '/api/composite/v1/');
    console.log('[proxy]', req.method, req.originalUrl, '→', url);
    return parsePath(url);
  },
  proxyReqOptDecorator: decorateHeaders,
}));

// Program + bulk question operations
app.use([
  '/action/program/v1/*',
  '/action/question/v2/bulkUpload',
  '/action/question/v2/bulkUploadStatus',
], proxy(BASE_URL, {
  https: true,
  limit: '30mb',
  proxyReqPathResolver(req) {
    const url = req.originalUrl.replace('/action/', '/api/');
    console.log('[proxy]', req.method, req.originalUrl, '→', url);
    return parsePath(url);
  },
  proxyReqOptDecorator: decorateHeaders,
}));

// Catch-all for any remaining /api, /assets, /action paths
app.use(['/api', '/assets', '/action'], proxy(BASE_URL, {
  https: true,
  limit: '30mb',
  proxyReqPathResolver(req) {
    console.log('[proxy]', req.method, req.url);
    return parsePath(req.url);
  },
  proxyReqOptDecorator: decorateHeaders,
}));

// Blob-storage assets via portal proxy
app.use(['/assets/public/*'], proxy(BASE_URL, {
  https: true,
  proxyReqPathResolver(req) {
    return parsePath(`https://${BASE_URL}${req.originalUrl}`);
  },
}));

// ── Start ─────────────────────────────────────────────────────────────────────

http.createServer(app).listen(PORT, () => {
  console.log(`\n[react-editor] server  → http://localhost:${PORT}`);
  console.log(`[react-editor] backend → ${BASE_URL}`);
  console.log(`[react-editor] open    → http://localhost:${PORT}/web-component/assets/quml-editor/`);
  console.log(`[react-editor]           http://localhost:${PORT}/\n`);
});
