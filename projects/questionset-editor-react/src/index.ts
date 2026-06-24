/**
 * index.ts — public API surface for the questionset-editor-react library.
 *
 * Only symbols exported here are part of the public contract.
 * Internal implementation details (store internals, API client internals, etc.)
 * should NOT be added here.
 */

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export { QuestionsetEditor } from './components/QuestionsetEditor/QuestionsetEditor';
export type { QuestionsetEditorProps } from './components/QuestionsetEditor/QuestionsetEditor';

// ---------------------------------------------------------------------------
// Web component registration
// ---------------------------------------------------------------------------

export { registerQuestionsetEditor } from './web-component/register';

// ---------------------------------------------------------------------------
// Zustand stores (for host-app integration / testing)
// ---------------------------------------------------------------------------

export { useEditorStore } from './store/editor.store';
export { useTreeStore } from './store/tree.store';
export { useQuestionStore } from './store/question.store';
export { useUiStore } from './store/ui.store';

// ---------------------------------------------------------------------------
// API utilities
// ---------------------------------------------------------------------------

export { setApiBaseUrl } from './api/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type {
  IEditorConfig,
  IEditorEvents,
  INode,
  EditorMode,
  ToolbarAction,
} from './types/editor';

export type {
  IQuestion,
  QuestionType,
  IOption,
  IMatchPair,
  IHint,
} from './types/question';
