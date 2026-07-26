/**
 * Deployment-owned destinations and release metadata.
 *
 * Values come from Vite env (`import.meta.env.VITE_*`), which Vercel injects at
 * build time from Project → Settings → Environment Variables.
 *
 * An empty / missing destination means it is not published yet; the UI
 * intentionally renders an honest unavailable state via hasValue().
 *
 * Only genuinely deployment-owned values belong here. This site's own routes do
 * not — they are fixed by `src/lib/routes.ts`, and an env override pointing one
 * elsewhere would leave the real route live as a second source of truth.
 *
 * Local: copy `.env.example` → `.env.local` and fill what you need.
 * Deploy: set the same keys in the Vercel dashboard (Production / Preview).
 */
function env(key: keyof ImportMetaEnv, fallback = ""): string {
  const value = import.meta.env[key];
  return typeof value === "string" ? value.trim() : fallback;
}

export const siteConfig = {
  /**
   * Origin for canonical URLs. Override on preview deployments so they do not
   * claim the production canonical. Trailing slashes are stripped so
   * `siteOrigin + canonicalPath` is always well formed.
   */
  siteOrigin: env("VITE_SITE_ORIGIN", "https://patchtray.io").replace(/\/+$/, ""),

  /**
   * Version and installer link are read live from the release manifest — see
   * `src/lib/release.ts` and `useLatestRelease()`. These two values are only the
   * fallback for when the release page cannot be reached.
   */
  releaseVersion: env("VITE_RELEASE_VERSION", "0.1.0"),
  downloadUrl: env("VITE_DOWNLOAD_URL"),
  /** Where the browser reads the manifest from; `/api/release` proxies GitHub (no CORS on release assets). */
  releaseManifestUrl: env("VITE_RELEASE_MANIFEST_URL", "/api/release"),

  releaseState: env("VITE_RELEASE_STATE", "public beta"),

  /** Published Pro pricing. Override via env if needed; do not invent other amounts in UI. */
  proMonthlyPrice: env("VITE_PRO_MONTHLY_PRICE", "$4.99"),
  proLifetimePrice: env("VITE_PRO_LIFETIME_PRICE", "$29.99"),

  /**
   * Published Stripe Payment Links. Environment overrides make it possible to
   * replace a link without a code release; the public defaults keep local and
   * self-hosted builds connected to the live storefront.
   */
  proMonthlyCheckoutUrl: env(
    "VITE_PRO_MONTHLY_CHECKOUT_URL",
    "https://buy.stripe.com/eVq3cu8984Z36Pi9VweQM00",
  ),
  proLifetimeCheckoutUrl: env(
    "VITE_PRO_LIFETIME_CHECKOUT_URL",
    "https://buy.stripe.com/eVqcN44WWgHLa1u5FgeQM01",
  ),

  /** Published contact for support, privacy requests, and security reports. */
  supportEmail: env("VITE_SUPPORT_EMAIL", "support@patchtray.io"),

  /**
   * Cloudflare Turnstile site key for the /support form. Empty hides the form
   * and leaves the mailto path, since there is no safe way to accept
   * submissions without the verification the server requires.
   */
  turnstileSiteKey: env("VITE_TURNSTILE_SITE_KEY"),

  requirementsText: env(
    "VITE_REQUIREMENTS_TEXT",
    "Windows and an ASIO driver are required. PatchTray is commonly used with Voicemeeter ASIO inserts; other ASIO-capable mixers that accept insert patching can work the same way. Detailed system requirements are being finalized for the public beta.",
  ),
};

export const hasValue = (value: string) => value.trim().length > 0;
