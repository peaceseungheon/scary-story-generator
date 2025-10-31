/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_REQUEST_TIMEOUT_MS?: string;
  readonly VITE_REQUEST_RETRY_LIMIT?: string;
  readonly VITE_REQUEST_RETRY_DELAY_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
