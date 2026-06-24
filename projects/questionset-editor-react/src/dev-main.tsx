/**
 * dev-main.tsx — development entry point.
 *
 * Mounts QuestionsetEditor directly into #root with mock config so the editor
 * can be developed and tested without a full Sunbird portal integration.
 *
 * This file is referenced by vite.config.ts in dev mode and is NOT included
 * in the production library bundle.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QuestionsetEditor } from './components/QuestionsetEditor/QuestionsetEditor';

// ---------------------------------------------------------------------------
// Mock config — tweak as needed for local development
// ---------------------------------------------------------------------------

const MOCK_CONFIG = {
  context: {
    authToken: 'test-token',
    userId: 'user-001',
    sid: 'session-001',
    did: 'device-001',
    channel: 'devChannel',
    pdata: { id: 'dev.sunbird', ver: '1.0' },
    env: 'dev',
    contentId: 'do_test_questionset_001',
    framework: 'NCF',
  },
  config: {
    mode: 'edit' as const,
    objectType: 'QuestionSet',
    primaryCategory: 'Practice Question Set',
    maxDepth: 3,
  },
};

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('[dev-main] No #root element found in index.html');
}

createRoot(rootEl).render(
  <QuestionsetEditor
    {...MOCK_CONFIG}
    onToolbarEvent={(e) => console.log('[toolbar]', e)}
    onError={(e) => console.error('[error]', e)}
  />,
);
