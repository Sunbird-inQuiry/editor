# @project-sunbird/sunbird-questionset-editor-web-component-react

A React-based authoring editor for Sunbird QuML QuestionSets (question banks organized into sections/hierarchy). It is distributed as:

- a native **custom element** — `<sb-questionset-editor>` — that can be embedded in any framework or plain HTML, and
- a **React component** (`QuestionsetEditor`) for apps that are already on React.

It replaces the older Angular `questionset-editor-library` and is built to be embedded by a host app (e.g. the Sunbird portal), not run standalone.

---

## Installation

```bash
npm install @project-sunbird/sunbird-questionset-editor-web-component-react react react-dom
```

`react` and `react-dom` are **peer dependencies** (`^18.0.0 || ^19.0.0`) — they are not bundled and must be provided by the host page/app. The published bundle externalizes `react`, `react-dom`, `react-dom/client`, and `react/jsx-runtime`, so your app (or an import map, if you're not using a bundler) must resolve these.

The package ships as an ES module only:

| package.json field | value |
|---|---|
| `module` / entry | `dist/index.js` |
| `types` | `dist/index.d.ts` |
| stylesheet | `dist/style.css` (import path: `@project-sunbird/sunbird-questionset-editor-web-component-react/dist/style.css`) |
| `files` | `dist` (everything published lives under `dist/`) |

The component renders in the light DOM (no Shadow DOM), so it relies on the page loading `dist/style.css` — it does not inject its own styles.

### Static assets that must be served

The `dist/` folder contains more than just `index.js`/`style.css`; it also includes assets that are referenced at **fixed, root-relative runtime paths**, not resolved via the module graph. Your app must make these reachable at the paths below (e.g. copy them into your public/static directory, or serve `dist/` itself at your app root):

- `dist/assets/sunbird-quml-player.js` and `dist/assets/sunbird-quml-player-styles.css` — the QuML player used for question/questionset preview, lazy-loaded at runtime from `/assets/sunbird-quml-player.js` by default (override via `config.playerScriptUrl`).
- `dist/assets/libs/mathEquation/**` — the MathQuill/KaTeX equation-editor modal (iframe), resolved relative to `index.js`'s own location.
- `dist/fonts/**` — KaTeX fonts used by the math/equation rendering.
- `dist/ckeditor/ckeditor.js` — CKEditor 4 classic build used for rich-text question/option fields. This is **not loaded automatically**; the host page must load it as a global `<script>` tag before the editor mounts (it registers `window.ClassicEditor`, which `CKEditorField` looks for).

---

## Quick start — Web component (framework-agnostic)

Register the custom element once, then create it like any other DOM element and set its configuration as element **properties** (not string attributes) so React receives real objects:

```html
<script src="/ckeditor/ckeditor.js"></script>
<link rel="stylesheet" href="/style.css" />

<div id="root"></div>

<script type="module">
  import { registerQuestionsetEditor } from '@project-sunbird/sunbird-questionset-editor-web-component-react';
  registerQuestionsetEditor(); // defines <sb-questionset-editor>, idempotent

  const editor = document.createElement('sb-questionset-editor');

  editor.context = {
    authToken: '',
    userId: 'user-001',
    channel: 'my-channel',
    pdata: { id: 'sunbird.portal', ver: '1.0' },
    env: 'questionset_editor',
    contentId: 'do_123',
    identifier: 'do_123',
    framework: 'NCF',
  };

  editor.config = {
    mode: 'edit',
    objectType: 'QuestionSet',
    primaryCategory: 'Practice Question Set',
    maxDepth: 3,
  };

  editor.style.cssText = 'display:block;width:100%;height:100%;';
  document.getElementById('root').appendChild(editor);
</script>
```

The tag name is fixed: **`sb-questionset-editor`**. `registerQuestionsetEditor()` guards against double-registration, so it's safe to call more than once.

---

## Quick start — React

```tsx
import { QuestionsetEditor } from '@project-sunbird/sunbird-questionset-editor-web-component-react';
import '@project-sunbird/sunbird-questionset-editor-web-component-react/dist/style.css';

<QuestionsetEditor
  context={context}
  config={config}
  onQuestionSaved={(question) => console.log('saved', question)}
  onHierarchySaved={(hierarchy) => console.log('hierarchy saved', hierarchy)}
  onError={(err) => console.error(err)}
/>
```

---

## API

### `<QuestionsetEditor>` props

| Prop | Type | Required | Description |
|---|---|---|---|
| `context` | `IContext` | ✅ | Runtime context — user, session, channel, content identifier |
| `config` | `IConfig` | ✅ | Editor mode and behaviour |
| `metadata` | `Record<string, unknown>` | — | Pre-loaded content metadata |
| `data` | `unknown` | — | Reserved/advanced pass-through data |
| `apiBaseUrl` | `string` | — | Base URL for all API calls. Omit when using a server-side proxy |
| `onToolbarEvent` | `(e: { action: ToolbarAction; data?: unknown }) => void` | — | Fired on every toolbar action |
| `onQuestionSaved` | `(question: unknown) => void` | — | Fired after a question is saved |
| `onHierarchySaved` | `(hierarchy: unknown) => void` | — | Fired after a successful hierarchy save |
| `onError` | `(error: Error) => void` | — | Fired on unrecoverable editor errors |

On the web component, set the same fields as element **properties** (e.g. `editor.onQuestionSaved = (q) => ...`), the same way `context`/`config` are set.

### `IContext`

Identifies the current user/session and the content being edited. `sid`, `did`, `channel`, and `pdata` are required; everything else is optional.

```ts
interface IContext {
  authToken?: string;
  userId?: string;
  user?: { id: string; fullName?: string; firstName?: string; lastName?: string; orgIds?: string[] };
  sid: string;
  did: string;
  uid?: string;
  channel: string;
  pdata: { id: string; ver: string; pid?: string };
  env?: string;
  contentId?: string;
  identifier?: string;      // same value as contentId is also accepted
  framework?: string;
  targetFWIds?: string[];
  rollup?: Record<string, string>;
  contextRollup?: Record<string, string>;
  objectRollup?: Record<string, string>;
  cdata?: Array<Record<string, unknown>>;
  tags?: string[];
  host?: string;             // telemetry host/endpoint
  endpoint?: string;
  timeDiff?: number;
  defaultLicense?: string;
  enableReviewEdit?: boolean;   // allow reviewer edits in orgreview/sourcingreview
  uiLanguage?: string;          // 'en' | 'ar' | 'fr' | 'hi' | 'pt'
  labels?: Record<string, string>;  // overrides for editor button labels
  cloudStorage?: { provider?: string; presigned_headers?: Record<string, string> };
  cloudStorageUrls?: string[];  // blob-storage origins to rewrite to /assets/public/
}
```

### `IConfig`

Controls editor mode and behaviour. `mode` and `objectType` are required.

```ts
interface IConfig {
  mode: 'edit' | 'review' | 'read' | 'orgreview' | 'sourcingreview';
  objectType: string;               // e.g. 'QuestionSet'
  hideSubmitForReviewBtn?: boolean;
  playerScriptUrl?: string;         // default '/assets/sunbird-quml-player.js'
  apiSlug?: string;                 // API path prefix, default '/api'
  questionSet?: { maxQuestionsLimit?: number };
  showAddCollaborator?: boolean;
  primaryCategory?: string;
  framework?: string[];
  targetFWIds?: string[];
  toolbarConfig?: Record<string, unknown>;
  hierarchy?: Record<string, unknown>;
  children?: unknown[];
  defaultFields?: Record<string, unknown>;
  maxDepth?: number;
  questionTypes?: string[];         // restrict which question types are offered
  maxQuestions?: number;
  showSolutions?: boolean;
  showHints?: boolean;
  showTimer?: boolean;
  categoryDefinitionApiVersion?: 'v1' | 'v4';  // default 'v4'
}
```

### `ToolbarAction`

```ts
type ToolbarAction =
  | 'back' | 'preview' | 'sendForReview' | 'onFormValueChange' | 'onFormStatusChange'
  | 'saveContent' | 'publish' | 'reject' | 'sendBackForCorrections'
  | 'sourcingApprove' | 'sourcingReject' | 'addQuestion' | 'addSection' | 'deleteNode';
```

---

## API base URL

By default all API calls are made relative to the page origin (works with a server-side proxy). To point directly at a backend, either pass the prop:

```tsx
<QuestionsetEditor {...config} apiBaseUrl="https://api.your-sunbird-instance.com" />
```

or call the exported setters directly (also lets you override the `/api` path prefix independently):

```ts
import { setApiBaseUrl, setApiSlug } from '@project-sunbird/sunbird-questionset-editor-web-component-react';

setApiBaseUrl('https://api.your-sunbird-instance.com');
setApiSlug('/api'); // default
```

---

## Stores (advanced)

The editor exposes its internal Zustand stores for advanced integration scenarios — for example, reading the current tree selection or editor mode from outside the component:

```ts
import { useEditorStore, useTreeStore, useQuestionStore, useUiStore } from '@project-sunbird/sunbird-questionset-editor-web-component-react';

// Inside a React component
const selectedNodeId = useTreeStore((s) => s.selectedNodeId);
const editorMode      = useEditorStore((s) => s.editorMode);
```

---

## Styles

The stylesheet **must** be imported once in your app — it is not auto-injected (the component renders in the light DOM, not Shadow DOM):

```ts
import '@project-sunbird/sunbird-questionset-editor-web-component-react/dist/style.css';
```

---

## Supported question types

Registered out of the box (matching the old editor's six built-in QuML types):

| Type | `qType` | `primaryCategory` | Description |
|---|---|---|---|
| Multiple Choice | `MCQ` | Multiple Choice Question | Pick one correct option from a list |
| Subjective | `SA` (aliases: `VSA`, `LA`) | Subjective Question | Free-form written or long answer |
| Fill in the Blank | `FTB` | FTB Question | Hide words in a sentence with `[[ ]]` |
| Match the Following | `MTF` | Match The Following Question | Pair items across two columns |
| Sequence | `SEQ` | Sequence Question | Arrange items in the correct order |
| Reorder | `REO` | Reorder Question | Rearrange shuffled words into a sentence |
| True / False | `BOOL` | Boolean Question | Pick between true or false choices |

`config.questionTypes` can be used to restrict which of these are offered when adding a question. Host apps can also register additional/custom types before mounting the editor via the exported registry functions: `registerQuestionType`, `resolveQuestionType`, `resolveByQType`, `resolveByCategory`, `resolveByInteractionType`, `allQuestionTypes`.

---

## Development setup

```bash
# Clone the monorepo
git clone https://github.com/Sunbird-inQuiry/editor.git
cd editor/projects/questionset-editor-react

# Install
npm install

# Dev server (mock API by default; set BASE_URL to proxy to a real backend)
npm run dev

# Build library (runs tsc -b && vite build)
npm run build

# Run tests
npm test
```

---

## Compatibility

| Dependency | Version |
|---|---|
| React | 18.x or 19.x |
| React DOM | 18.x or 19.x |

---

## License

MIT — see the repository root for the full licence text.

---

## Notes and caveats

- **CKEditor must be loaded manually.** Add `<script src=".../ckeditor.js"></script>` (from this package's `dist/ckeditor/ckeditor.js`) to the host page before the editor mounts; rich-text fields look for `window.ClassicEditor` and log an error if it isn't present.
- **No Shadow DOM.** The custom element renders into the light DOM so the Sunbird design system CSS (`dist/style.css`) applies directly — make sure it's loaded on the page.
- **QuML player script** for previews defaults to the root-relative path `/assets/sunbird-quml-player.js`; override with `config.playerScriptUrl` if you serve it elsewhere.
- Localized UI labels are available for `en`, `ar`, `fr`, `hi`, `pt` via `context.uiLanguage`.
- This package is ESM-only (`"type": "module"`) and built for evergreen browsers; there is no UMD/CJS build.
