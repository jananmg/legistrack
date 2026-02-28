/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONGRESS_API_KEY: string;
  readonly VITE_LEGISCAN_API_KEY: string;
  readonly VITE_PROPUBLICA_API_KEY: string;
  readonly VITE_POLL_INTERVAL_MINUTES: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
