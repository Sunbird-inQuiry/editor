/// <reference types="vite/client" />

declare module '*.svg?raw' {
  const content: string;
  export default content;
}

// Dev env vars are injected via vite.config.ts `define.__EDITOR_ENV__`,
// not through import.meta.env. See src/dev-main.tsx for usage.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
