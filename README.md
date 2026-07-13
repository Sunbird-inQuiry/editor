# QuestionSet Editor for Sunbird!

This monorepo contains two QuestionSet Editor implementations:

- **[`projects/questionset-editor-react`](./projects/questionset-editor-react)** — the new React-based editor (recommended for new integrations). Published as [`@project-sunbird/sunbird-questionset-editor-web-component-react`](https://www.npmjs.com/package/@project-sunbird/sunbird-questionset-editor-web-component-react), usable as a React component or as a framework-agnostic `<sb-questionset-editor>` web component.
- **`projects/questionset-editor-library`** (+ `questionset-editor-library-wc`) — the original Angular-based editor. See [Old Editor Integration](#old-editor-integration-angular) below.

---

## React QuestionSet Editor — Getting Started

```bash
npm install @project-sunbird/sunbird-questionset-editor-web-component-react react react-dom
```

`react`/`react-dom` (`^18.0.0 || ^19.0.0`) are peer dependencies, not bundled.

**As a framework-agnostic web component:**

```html
<script src="/ckeditor/ckeditor.js"></script>
<link rel="stylesheet" href="/style.css" />

<script type="module">
  import { registerQuestionsetEditor } from '@project-sunbird/sunbird-questionset-editor-web-component-react';
  registerQuestionsetEditor(); // defines <sb-questionset-editor>

  const editor = document.createElement('sb-questionset-editor');
  editor.context = { channel: 'my-channel', pdata: { id: 'sunbird.portal', ver: '1.0' }, sid: '...', did: '...' };
  editor.config  = { mode: 'edit', objectType: 'QuestionSet', primaryCategory: 'Practice Question Set' };
  document.body.appendChild(editor);
</script>
```

**As a React component:**

```tsx
import { QuestionsetEditor } from '@project-sunbird/sunbird-questionset-editor-web-component-react';
import '@project-sunbird/sunbird-questionset-editor-web-component-react/dist/style.css';

<QuestionsetEditor
  context={context}
  config={config}
  onQuestionSaved={(question) => console.log('saved', question)}
/>
```

For full installation steps (including static assets that must be served), configuration shape (`IContext`/`IConfig`), events, supported question types, advanced store access, and local development setup, see the package README:

**[`projects/questionset-editor-react/README.md`](./projects/questionset-editor-react/README.md)**

---

# Old Editor Integration (Angular)

Question Set Editor library components is powered by angular. This editor is primarily designed to be used in the sunbirdEd portal and web portal to drive reusability, maintainability hence reducing the redundant development effort significantly. And it can be integrated with any platform irrespective of the platforms and the frontend frameworks. It is exported not only as an angular library but also as a web component aims to make it easy to share, discover, and reuse web components. It creates a framework agnostic way of composing and re-purposing code.

## Getting started with integration steps
The Question Set Editor can be integrated as a web component and also as an angular library in angular application projects and it can also be integrated into vanilla javascript and angular framework as a web component.

- [Using it as Web component](https://inquiry.sunbird.org/use/developer-installation/question-set-editor/installation#use-as-web-components)
- [Using it as Angular library](https://inquiry.sunbird.org/use/developer-installation/question-set-editor/installation#use-as-angular-library-in-angular-app)

## Editor Contribution and Configuration Guide

[Contribution guidelines for this project](https://inquiry.sunbird.org/use/developer-installation/question-set-editor/installation#questionset-editor-contribution-guide)

[Configuration guidelines for this project](https://inquiry.sunbird.org/learn/product-and-developer-guide/question-and-question-set-editor/configuration)
