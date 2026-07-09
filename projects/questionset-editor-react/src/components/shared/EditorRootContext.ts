import { createContext } from 'react';

/**
 * The owning editor instance's `.ce` root element. Modals portal into it so
 * the `--sb-*`/`--accent` variables (scoped to `.ce`) apply — a global
 * `document.querySelector('.ce')` would resolve to the FIRST editor on the
 * page, which is wrong when a host mounts multiple instances.
 */
export const EditorRootContext = createContext<HTMLElement | null>(null);
