declare module 'react-to-webcomponent' {
  import type { ComponentType } from 'react';
  function reactToWebComponent(
    component: ComponentType<any>,
    React: unknown,
    ReactDOM: unknown,
    options?: { shadow?: 'open' | 'closed' },
  ): CustomElementConstructor;
  export = reactToWebComponent;
}
