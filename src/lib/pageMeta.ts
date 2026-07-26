import type { PageName } from "./types";

export type PageMeta = {
  title: string;
  description: string;
  /**
   * Path for `<link rel="canonical">`, resolved against `siteConfig.siteOrigin`.
   * Omitted for anything that should stay out of search results.
   */
  canonicalPath?: string;
  /** Transactional, unlinked, or error routes. Pairs with an `X-Robots-Tag` header. */
  noindex?: true;
};

export const pageMeta: Record<PageName, PageMeta> = {
  home: {
    title: "PatchTray — process live audio with VST3 plugins",
    description:
      "A Windows VST3 host for building visible ASIO signal chains and keeping them running from the system tray.",
    canonicalPath: "/",
  },
  download: {
    title: "Download PatchTray for Windows",
    description: "PatchTray public beta download, requirements, and Free / Pro details.",
    canonicalPath: "/download",
  },
  guide: {
    title: "PatchTray guide — build your first live plugin chain",
    description:
      "A practical starting guide for PatchTray, Windows, ASIO, VST3 processors, and mixer routing.",
    canonicalPath: "/guide",
  },
  privacy: {
    title: "Privacy policy — PatchTray",
    description:
      "What PatchTray stores for purchases, licenses, and device activation, who processes it, and how long it is kept.",
    canonicalPath: "/privacy",
  },
  terms: {
    title: "Terms — PatchTray",
    description:
      "The terms covering PatchTray Free and Pro entitlements, billing, device limits, offline leases, and acceptable use.",
    canonicalPath: "/terms",
  },
  refunds: {
    title: "Refunds and disputes — PatchTray",
    description: "The refund and payment-dispute policy for PatchTray Pro monthly and lifetime licenses.",
    canonicalPath: "/refunds",
  },
  support: {
    title: "Support — PatchTray",
    description:
      "Get help with PatchTray licenses, activation, device limits, downloads, billing, and privacy or security reports.",
    canonicalPath: "/support",
  },
  checkoutSuccess: {
    title: "Payment submitted — PatchTray Pro",
    description: "Your PatchTray Pro payment was submitted. Your license key arrives by email.",
    noindex: true,
  },
  concepts: {
    title: "PatchTray concepts — design review",
    description: "Unlinked design-review route comparing the routing composition at two densities.",
    noindex: true,
  },
  notFound: {
    title: "Route not found — PatchTray",
    description: "That address does not resolve to a route on patchtray.io.",
    noindex: true,
  },
};
