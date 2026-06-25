/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIVE_MODE: string;
  readonly VITE_CONTENT_ID: string;
  readonly VITE_CHANNEL: string;
  readonly VITE_DEVICE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
