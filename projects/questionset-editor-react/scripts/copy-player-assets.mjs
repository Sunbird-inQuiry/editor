import { cpSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicAssets = resolve(root, 'public', 'assets');

mkdirSync(publicAssets, { recursive: true });

// QUML player — the package ships everything under assets/quml-player/:
//   sunbird-quml-player.js  → served at /assets/sunbird-quml-player.js
//                             (the loader's default path, old editor parity)
//   styles.css              → /assets/sunbird-quml-player-styles.css
//   assets/*                → /assets/ (icons/fonts the player fetches)
// Prefer the React player; fall back to the old Angular WC bundle if absent.
const playerPkg = ['sunbird-quml-player-web-component-react', 'sunbird-quml-player-web-component']
  .map((pkg) => resolve(root, 'node_modules', '@project-sunbird', pkg, 'assets', 'quml-player'))
  .find(existsSync);
if (playerPkg) {
  const playerJs = resolve(playerPkg, 'sunbird-quml-player.js');
  if (existsSync(playerJs)) {
    cpSync(playerJs, resolve(publicAssets, 'sunbird-quml-player.js'));
  }
  const playerCss = resolve(playerPkg, 'styles.css');
  if (existsSync(playerCss)) {
    cpSync(playerCss, resolve(publicAssets, 'sunbird-quml-player-styles.css'));
  }
  const playerAssets = resolve(playerPkg, 'assets');
  if (existsSync(playerAssets)) {
    cpSync(playerAssets, publicAssets, { recursive: true });
  }
  console.log(`[copy-player-assets] Copied QUML player bundle + assets from ${playerPkg}`);
} else {
  console.warn('[copy-player-assets] QUML player package not found – run npm install');
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
