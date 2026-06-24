// TypeScript declaration for CSS / SCSS Modules
// Enables `import styles from './Foo.module.scss'` with full type safety.

declare module '*.module.scss' {
  const styles: Record<string, string>;
  export default styles;
}

declare module '*.module.css' {
  const styles: Record<string, string>;
  export default styles;
}
