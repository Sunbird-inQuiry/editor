import reactToWebComponent from 'react-to-webcomponent';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QuestionsetEditor } from '../components/QuestionsetEditor/QuestionsetEditor';

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';

function injectGoogleFonts(root: ShadowRoot): void {
  if (root.querySelector('link[data-sbx-fonts]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONTS_HREF;
  link.setAttribute('data-sbx-fonts', '');
  root.prepend(link);
}

// react-to-webcomponent reads ReactComponent.propTypes to build observedAttributes.
// QuestionsetEditor uses TypeScript interfaces only (no runtime propTypes), so
// nothing would be observed without this stub. Values don't matter — only the
// keys are used (via Object.keys) to produce the observedAttributes list.
(QuestionsetEditor as unknown as Record<string, unknown>).propTypes = {
  context:          null,
  config:           null,
  metadata:         null,
  onToolbarEvent:   null,
  onQuestionSaved:  null,
  onHierarchySaved: null,
  onError:          null,
};

// No shadow DOM — styles from dist/style.css (loaded by the host page) apply
// directly to the component. Shadow DOM would isolate the component from those
// styles, breaking the Sunbird design system.
const BaseWebComponent = reactToWebComponent(QuestionsetEditor, React, ReactDOM as unknown as typeof import('react-dom'), {});

function SbQuestionsetEditor(this: HTMLElement) {
  const inst = Reflect.construct(BaseWebComponent, [], SbQuestionsetEditor);
  return inst;
}
SbQuestionsetEditor.prototype = Object.create((BaseWebComponent as unknown as { prototype: object }).prototype, {
  constructor: { value: SbQuestionsetEditor },
});

export function registerQuestionsetEditor(): void {
  if (!customElements.get('sb-questionset-editor')) {
    customElements.define('sb-questionset-editor', SbQuestionsetEditor as unknown as CustomElementConstructor);
  }
}
