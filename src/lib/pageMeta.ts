import type { PageName } from "./types";

export type OpenGraphImage = {
  path: string;
  alt: string;
  width: number;
  height: number;
  type: "image/png" | "image/jpeg" | "image/webp";
};

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
  openGraphTitle: string;
  openGraphDescription: string;
  openGraphImage: OpenGraphImage;
  openGraphType: "website";
};

type PageMetaInput = Omit<
  PageMeta,
  "openGraphTitle" | "openGraphDescription" | "openGraphImage" | "openGraphType"
> &
  Partial<Pick<PageMeta, "openGraphTitle" | "openGraphDescription">>;

const PATCHTRAY_SOCIAL_IMAGE: OpenGraphImage = {
  path: "/assets/patchtray-canvas.png",
  alt: "PatchTray routing an ASIO input through a VST3 plugin to an ASIO output on its visual canvas.",
  width: 1745,
  height: 1073,
  type: "image/png",
};

function definePage(meta: PageMetaInput): PageMeta {
  return {
    ...meta,
    openGraphTitle: meta.openGraphTitle ?? meta.title,
    openGraphDescription: meta.openGraphDescription ?? meta.description,
    openGraphImage: PATCHTRAY_SOCIAL_IMAGE,
    openGraphType: "website",
  };
}

export const pageMeta: Record<PageName, PageMeta> = {
  home: definePage({
    title: "PatchTray — process live audio with VST3 plugins",
    description:
      "A Windows VST3 host for building visible ASIO signal chains and keeping them running from the system tray.",
    canonicalPath: "/",
    openGraphTitle: "PatchTray — a visible VST3 host for live Windows audio",
  }),
  download: definePage({
    title: "Download PatchTray for Windows",
    description:
      "Download PatchTray for Windows, review ASIO requirements, and compare the Free and Pro VST3 host plans.",
    canonicalPath: "/download",
  }),
  guide: definePage({
    title: "PatchTray guide — build your first live plugin chain",
    description:
      "Learn how to choose ASIO ports, add VST3 processors, connect a live audio route, and save it in PatchTray.",
    canonicalPath: "/guide",
  }),
  guides: definePage({
    title: "VST3 and ASIO guides for Windows — PatchTray",
    description:
      "Practical PatchTray guides for Voicemeeter inserts, standalone VST3 effects, ASIO routing, and live Windows audio.",
    canonicalPath: "/guides",
  }),
  faq: definePage({
    title: "PatchTray FAQ — VST3, ASIO, Voicemeeter, and licensing",
    description:
      "Direct answers about PatchTray for Windows, live VST3 processing, ASIO routing, Voicemeeter inserts, latency, and Free versus Pro.",
    canonicalPath: "/faq",
    openGraphTitle: "PatchTray FAQ — answers for live Windows audio",
  }),
  voicemeeterVst3Guide: definePage({
    title: "How to use VST3 plugins with Voicemeeter | PatchTray",
    description:
      "Configure a Voicemeeter ASIO insert, match its channels in PatchTray, build a VST3 microphone chain, and test the route safely.",
    canonicalPath: "/guides/voicemeeter-vst3-plugins",
  }),
  vst3WithoutDawGuide: definePage({
    title: "How to run VST3 effects without a DAW on Windows",
    description:
      "Connect an ASIO input, live VST3 effect chain, and ASIO output in PatchTray without opening a recording session.",
    canonicalPath: "/guides/run-vst3-without-daw",
  }),
  privacy: definePage({
    title: "Privacy policy — PatchTray",
    description:
      "What PatchTray stores for purchases, licenses, and device activation, who processes it, and how long it is kept.",
    canonicalPath: "/privacy",
  }),
  terms: definePage({
    title: "Terms — PatchTray",
    description:
      "The terms covering PatchTray Free and Pro entitlements, billing, device limits, offline leases, and acceptable use.",
    canonicalPath: "/terms",
  }),
  refunds: definePage({
    title: "Refunds and disputes — PatchTray",
    description: "The refund and payment-dispute policy for PatchTray Pro monthly and lifetime licenses.",
    canonicalPath: "/refunds",
  }),
  support: definePage({
    title: "PatchTray support — licenses, activation, downloads, and billing",
    description:
      "Get help with PatchTray licenses, activation, device limits, downloads, billing, and privacy or security reports.",
    canonicalPath: "/support",
  }),
  checkoutSuccess: definePage({
    title: "Payment submitted — PatchTray Pro",
    description: "Your PatchTray Pro payment was submitted. Your license key arrives by email.",
    noindex: true,
  }),
  concepts: definePage({
    title: "PatchTray concepts — design review",
    description: "Unlinked design-review route comparing the routing composition at two densities.",
    noindex: true,
  }),
  blog: definePage({
    title: "PatchTray blog — product, workflow, and engineering notes",
    description:
      "Product explanations, live audio workflows, engineering notes, release stories, and company updates from PatchTray.",
    canonicalPath: "/blog",
  }),
  blogArticle: definePage({
    title: "PatchTray blog article",
    description:
      "A PatchTray article about live Windows audio, VST3 processing, product workflows, or engineering.",
    noindex: true,
  }),
  notFound: definePage({
    title: "Route not found — PatchTray",
    description: "That address does not resolve to a PatchTray route.",
    noindex: true,
  }),
};
