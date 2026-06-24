import { cpSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicAssets = resolve(root, 'public', 'assets');

mkdirSync(publicAssets, { recursive: true });

const playerPkg = resolve(root, 'node_modules', '@project-sunbird', 'sunbird-quml-player-web-component', 'assets');
if (existsSync(playerPkg)) {
  cpSync(playerPkg, resolve(publicAssets, 'quml-player'), { recursive: true });
  console.log('[copy-player-assets] Copied QUML player assets');
} else {
  console.warn('[copy-player-assets] QUML player package not found – skipping asset copy');
}
