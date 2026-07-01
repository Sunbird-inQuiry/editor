/**
 * dev-main.tsx — development entry point.
 *
 * Two modes:
 *
 * 1. MOCK (default) — works offline, no backend needed.
 *    Uses hardcoded mock data in dev/mock-data.ts.
 *
 * 2. REAL — connects to an actual Sunbird backend.
 *    Copy .env.example to .env.local and fill in your values.
 *    The Vite proxy will forward API calls with your auth token.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QuestionsetEditor } from './components/QuestionsetEditor/QuestionsetEditor';

// Injected by vite.config.ts from .env.local at dev-server start.
// Only non-sensitive values are included — auth tokens stay in proxy-config.ts.
declare const __EDITOR_ENV__: {
  CONTENT_ID: string;
  CHANNEL:    string;
  FRAMEWORK:  string;
  USER_ID:    string;
  SID:        string;
  DID:        string;
  MODE:       string;
};

const e = __EDITOR_ENV__;

const CONFIG = {
  context: {
    authToken: '',  // auth handled by proxy (see dev/proxy-config.ts)
    userId:    e.USER_ID    || 'user-001',
    sid:       e.SID        || 'session-001',
    did:       e.DID        || 'device-001',
    channel:   e.CHANNEL    || 'devChannel',
    pdata:     { id: 'dev.sunbird.portal', ver: '1.0' },
    env:       'questionset_editor',
    contentId: e.CONTENT_ID || 'do_test_questionset_001',
    identifier:e.CONTENT_ID || 'do_test_questionset_001',
    framework: e.FRAMEWORK  || 'NCF',
  },
  config: {
    mode:            (e.MODE || 'edit') as 'edit' | 'review' | 'read',
    objectType:      'QuestionSet',
    primaryCategory: 'Practice Question Set',
    maxDepth:        3,
  },
};

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('[dev-main] No #root element found');

createRoot(rootEl).render(
  <QuestionsetEditor
    {...CONFIG}
    onToolbarEvent={(ev) => console.log('[toolbar]', ev)}
    onError={(err) => console.error('[error]', err)}
  />,
);
