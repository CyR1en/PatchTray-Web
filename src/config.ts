/**
 * Deployment-owned destinations and release metadata.
 *
 * Values come from Vite env (`import.meta.env.VITE_*`), which Vercel injects at
 * build time from Project → Settings → Environment Variables.
 *
 * An empty / missing destination means it is not published yet; the UI
 * intentionally renders an honest unavailable state via hasValue().
 *
 * Local: copy `.env.example` → `.env.local` and fill what you need.
 * Deploy: set the same keys in the Vercel dashboard (Production / Preview).
 */
function env(key: keyof ImportMetaEnv, fallback = ""): string {
  const value = import.meta.env[key];
  return typeof value === "string" ? value.trim() : fallback;
}

export const siteConfig = {
  productName: "PatchTray",
  releaseVersion: env("VITE_RELEASE_VERSION", "0.1.0"),
  releaseState: env("VITE_RELEASE_STATE", "public beta"),
  downloadUrl: env("VITE_DOWNLOAD_URL"),

  /** Published Pro pricing. Override via env if needed; do not invent other amounts in UI. */
  proMonthlyPrice: env("VITE_PRO_MONTHLY_PRICE", "$4.99"),
  proLifetimePrice: env("VITE_PRO_LIFETIME_PRICE", "$29.99"),

  /** Checkout destinations — empty until a real storefront is live. */
  proMonthlyCheckoutUrl: env("VITE_PRO_MONTHLY_CHECKOUT_URL"),
  proLifetimeCheckoutUrl: env("VITE_PRO_LIFETIME_CHECKOUT_URL"),

  supportEmail: env("VITE_SUPPORT_EMAIL"),
  repositoryUrl: env("VITE_REPOSITORY_URL"),
  communityUrl: env("VITE_COMMUNITY_URL"),
  privacyUrl: env("VITE_PRIVACY_URL"),
  termsUrl: env("VITE_TERMS_URL"),
  requirementsText: env(
    "VITE_REQUIREMENTS_TEXT",
    "Windows and an ASIO driver are required. PatchTray is commonly used with Voicemeeter ASIO inserts; other ASIO-capable mixers that accept insert patching can work the same way. Detailed system requirements are being finalized for the public beta.",
  ),
};

export const hasValue = (value: string) => value.trim().length > 0;
