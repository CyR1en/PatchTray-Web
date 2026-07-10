/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RELEASE_VERSION?: string;
  readonly VITE_RELEASE_STATE?: string;
  readonly VITE_DOWNLOAD_URL?: string;
  readonly VITE_PRO_MONTHLY_PRICE?: string;
  readonly VITE_PRO_LIFETIME_PRICE?: string;
  readonly VITE_PRO_MONTHLY_CHECKOUT_URL?: string;
  readonly VITE_PRO_LIFETIME_CHECKOUT_URL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_REPOSITORY_URL?: string;
  readonly VITE_COMMUNITY_URL?: string;
  readonly VITE_PRIVACY_URL?: string;
  readonly VITE_TERMS_URL?: string;
  readonly VITE_REQUIREMENTS_TEXT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
