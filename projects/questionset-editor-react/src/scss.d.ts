/**
 * scss.d.ts — TypeScript declaration for CSS Modules (*.module.scss).
 *
 * Tells TypeScript that importing a `.module.scss` file yields an object
 * whose keys are CSS class names (strings) and whose values are the
 * mangled class name strings at runtime.
 */
declare module '*.module.scss' {
  const styles: Record<string, string>;
  export default styles;
}
