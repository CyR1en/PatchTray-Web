/// <reference types="vite/client" />

declare const __BLOG_ENABLED__: boolean;

/** Release manifest captured at build time by `vite.config.ts`; `null` when the fetch failed. */
declare const __RELEASE_MANIFEST__: unknown;

interface ImportMetaEnv {
  readonly VITE_SITE_ORIGIN?: string;
  readonly VITE_RELEASE_VERSION?: string;
  readonly VITE_RELEASE_STATE?: string;
  readonly VITE_DOWNLOAD_URL?: string;
  readonly VITE_RELEASE_MANIFEST_URL?: string;
  readonly VITE_PRO_MONTHLY_PRICE?: string;
  readonly VITE_PRO_LIFETIME_PRICE?: string;
  readonly VITE_PRO_PRICE_CURRENCY?: string;
  readonly VITE_PRO_MONTHLY_CHECKOUT_URL?: string;
  readonly VITE_PRO_LIFETIME_CHECKOUT_URL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_REQUIREMENTS_TEXT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
