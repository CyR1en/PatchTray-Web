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
  Partial<
    Pick<PageMeta, "openGraphTitle" | "openGraphDescription" | "openGraphImage">
  >;

/**
 * Social cards. A page that is actually shared — the home page, a guide, the FAQ
 * — earns the screenshot that matches what the reader is about to get, because
 * an identical card on every URL suppresses the click-through that earns links.
 * Legal and transactional routes keep the brand default; nobody shares those,
 * and a product screenshot beside a refund policy reads as a mistake.
 */
const CANVAS_IMAGE: OpenGraphImage = {
  path: "/assets/patchtray-canvas.png",
  alt: "PatchTray routing a VoiceMeeter Insert ASIO input through a VST3 plugin to an output as one supported setup example.",
  width: 1745,
  height: 1073,
  type: "image/png",
};

const PORTS_IMAGE: OpenGraphImage = {
  path: "/assets/patchtray-ports.png",
  alt: "PatchTray's ASIO input port dialog mapping a stereo Voicemeeter insert onto the left and right channels of a chain.",
  width: 1280,
  height: 720,
  type: "image/png",
};

const SETTINGS_IMAGE: OpenGraphImage = {
  path: "/assets/patchtray-settings.png",
  alt: "PatchTray audio settings showing an ASIO device as one supported duplex-device configuration example.",
  width: 1280,
  height: 720,
  type: "image/png",
};

const TELEMETRY_IMAGE: OpenGraphImage = {
  path: "/assets/patchtray-telemetry.png",
  alt: "PatchTray running an ASIO input and output as one supported setup example, with signal meters and telemetry active.",
  width: 1280,
  height: 720,
  type: "image/png",
};

function definePage(meta: PageMetaInput): PageMeta {
  return {
    ...meta,
    openGraphTitle: meta.openGraphTitle ?? meta.title,
    openGraphDescription: meta.openGraphDescription ?? meta.description,
    openGraphImage: meta.openGraphImage ?? CANVAS_IMAGE,
    openGraphType: "website",
  };
}

export const pageMeta: Record<PageName, PageMeta> = {
  home: definePage({
    title: "PatchTray — a visual VST3 host for live audio",
    description:
      "PatchTray is a visual VST3 host for live audio on Windows, with support for compatible duplex ASIO, Windows Audio, and DirectSound devices.",
    canonicalPath: "/",
    openGraphTitle: "PatchTray — a visual VST3 host for live audio",
  }),
  download: definePage({
    title: "Download PatchTray for Windows",
    description:
      "Download PatchTray for Windows, review supported duplex audio-device backends, and compare the Free and Pro VST3 host plans.",
    canonicalPath: "/download",
    openGraphImage: SETTINGS_IMAGE,
  }),
  pricing: definePage({
    title: "PatchTray pricing — Free, Pro monthly, and Pro lifetime",
    description:
      "PatchTray Pro pricing: unlimited VST3 nodes and presets for a monthly subscription or a one-time lifetime purchase, with a 7-day refund window on lifetime.",
    canonicalPath: "/pricing",
    openGraphTitle: "PatchTray pricing — buy a Pro license",
    openGraphImage: TELEMETRY_IMAGE,
  }),
  firstVst3ChainGuide: definePage({
    title: "How to build your first VST3 plugin chain on Windows",
    description:
      "Choose a compatible duplex audio device, add VST3 processors, connect its input and output on the canvas, and save the route as a preset.",
    canonicalPath: "/guides/build-your-first-vst3-chain",
  }),
  guides: definePage({
    title: "Live VST3 audio guides for Windows — PatchTray",
    description:
      "Practical PatchTray guides for VST3 chains, supported audio devices, VoiceMeeter Patch Inserts, standalone effects, and live Windows audio.",
    canonicalPath: "/guides",
  }),
  faq: definePage({
    title: "PatchTray FAQ — VST3, audio devices, and licensing",
    description:
      "Direct answers about PatchTray for Windows, live VST3 processing, supported audio backends, VoiceMeeter Patch Inserts, latency, and Free versus Pro.",
    canonicalPath: "/faq",
    openGraphTitle: "PatchTray FAQ — answers for live Windows audio",
    openGraphImage: TELEMETRY_IMAGE,
  }),
  voicemeeterVst3Guide: definePage({
    title: "How to use VST3 plugins with Voicemeeter | PatchTray",
    description:
      "Configure a Voicemeeter ASIO insert, match its channels in PatchTray, build a VST3 microphone chain, and test the route safely.",
    canonicalPath: "/guides/voicemeeter-vst3-plugins",
    openGraphImage: PORTS_IMAGE,
  }),
  vst3WithoutDawGuide: definePage({
    title: "How to run VST3 effects without a DAW on Windows",
    description:
      "Connect a supported duplex audio device through a live VST3 effect chain in PatchTray without opening a recording session.",
    canonicalPath: "/guides/run-vst3-without-daw",
    openGraphImage: TELEMETRY_IMAGE,
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
    title: "PatchTray support — audio routing, licenses, downloads, and billing",
    description:
      "Get help with PatchTray audio-device routing, licenses, activation, downloads, billing, and privacy or security reports.",
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
