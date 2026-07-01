import { cpSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicAssets = resolve(root, 'public', 'assets');

mkdirSync(publicAssets, { recursive: true });

// QUML player assets
const playerPkg = resolve(root, 'node_modules', '@project-sunbird', 'sunbird-quml-player-web-component', 'assets');
if (existsSync(playerPkg)) {
  cpSync(playerPkg, resolve(publicAssets, 'quml-player'), { recursive: true });
  console.log('[copy-player-assets] Copied QUML player assets');
} else {
  console.warn('[copy-player-assets] QUML player package not found – skipping asset copy');
}

// MathEquation modal (MathQuill UI used by the equation editor)
// We only copy if the destination doesn't exist — the public/ version has a
// patched index.html that intercepts /latex/convert so no backend is needed.
const mathModalSrc  = resolve(root, '..', '..', 'web-component-examples', 'vanilla-js', 'assets', 'libs', 'mathEquation');
const mathModalDest = resolve(root, 'public', 'assets', 'libs', 'mathEquation');
const patchedIndex  = resolve(root, 'public', 'assets', 'libs', 'mathEquation', 'plugin', 'mathModal', 'index.html');
if (existsSync(mathModalSrc) && !existsSync(patchedIndex)) {
  // First-time copy only — subsequent runs preserve the patched index.html
  mkdirSync(mathModalDest, { recursive: true });
  cpSync(mathModalSrc, mathModalDest, { recursive: true });
  console.log('[copy-player-assets] Copied mathEquation modal assets (first time)');
} else if (!existsSync(mathModalSrc)) {
  console.warn('[copy-player-assets] mathEquation assets not found – skipping');
}

// CKEditor build
const ckeditorSrc  = resolve(root, 'node_modules', '@project-sunbird', 'ckeditor-build-classic', 'build', 'ckeditor.js');
const ckeditorDest = resolve(root, 'public', 'ckeditor');
if (existsSync(ckeditorSrc)) {
  mkdirSync(ckeditorDest, { recursive: true });
  cpSync(ckeditorSrc, resolve(ckeditorDest, 'ckeditor.js'));
  console.log('[copy-player-assets] Copied CKEditor build');
}

// KaTeX fonts — needed by @tiptap/extension-mathematics
const katexFonts = resolve(root, 'node_modules', 'katex', 'dist', 'fonts');
const katexDest  = resolve(root, 'public', 'fonts');
if (existsSync(katexFonts)) {
  mkdirSync(katexDest, { recursive: true });
  const fontExts = new Set(['.woff', '.woff2', '.ttf']);
  for (const f of readdirSync(katexFonts)) {
    if (fontExts.has(extname(f))) {
      cpSync(resolve(katexFonts, f), resolve(katexDest, f));
    }
  }
  console.log('[copy-player-assets] Copied KaTeX fonts to public/fonts/');
} else {
  console.warn('[copy-player-assets] KaTeX fonts not found – skipping');
}
