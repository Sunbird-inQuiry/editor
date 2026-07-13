import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { mockApiPlugin } from './dev/mock-api-plugin';
import { buildProxyConfig } from './dev/proxy-config';

export default defineConfig(({ mode }) => {
  // Load .env.local (and .env) without requiring a prefix.
  // Only a safe subset is injected into the browser via `define`.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      dts({ include: ['src'] }),
      mockApiPlugin(),
    ],

    // Expose only non-sensitive dev config to the browser bundle.
    // Auth tokens stay server-side (used only in proxy-config.ts).
    // Also replace process.env.NODE_ENV so the library build doesn't
    // reference the Node.js `process` global when loaded in a browser.
    define: {
      __EDITOR_ENV__: JSON.stringify({
        CONTENT_ID: env.CONTENT_ID ?? '',
        CHANNEL:    env.CHANNEL    ?? '',
        FRAMEWORK:  env.FRAMEWORK  ?? '',
        USER_ID:    env.USER_ID    ?? '',
        SID:        env.SID        ?? '',
        DID:        env.DID        ?? '',
        MODE:       env.MODE       ?? '',
      }),
      'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
    },

    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'QuestionsetEditorReact',
        formats: ['es'],
        fileName: () => 'index.js',
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
        // Single-file bundle: hosts copy only index.js + style.css. Without
        // this, React.lazy components become separate chunks that 404 when
        // the host doesn't copy them (QuestionEditor-*.js etc.).
        output: {
          inlineDynamicImports: true,
          // Vite's default CSS asset name is derived from the package name —
          // force it to style.css, matching package.json's exports map
          // ("./dist/style.css") and the test harness's stylesheet link.
          assetFileNames: (asset) => (asset.name?.endsWith('.css') ? 'style.css' : '[name][extname]'),
        },
      },
    },

    server: {
      port: 5174,
      proxy: buildProxyConfig(),
    },

    css: {
      preprocessorOptions: {
        scss: { api: 'modern-compiler' },
      },
    },

    resolve: {
      alias: { '@': resolve(__dirname, 'src') },
    },
  };
});
