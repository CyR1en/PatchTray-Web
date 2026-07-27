import type { PageName } from "./types";

export type RouteDef = {
  /** Canonical path. No trailing slash, lowercase. */
  path: string;
  page: PageName;
  /** Public destination: appears in the 404 route list. */
  listed: boolean;
  /** Shown beside the path wherever the route is listed. */
  blurb?: string;
};

/**
 * Every path the site serves, in one place. A new page is one row here plus its
 * `pageMeta` entry — the router, the 404 route list, and the `/concepts`
 * exclusion all read from this table so they cannot drift apart.
 *
 */
export const routes: readonly RouteDef[] = [
  { path: "/", page: "home", listed: true, blurb: "home — the overview" },
  {
    path: "/download",
    page: "download",
    listed: true,
    blurb: "download — get the beta",
  },
  { path: "/guide", page: "guide", listed: true, blurb: "guide — get oriented" },
  { path: "/guides", page: "guides", listed: true, blurb: "guides — live audio workflows" },
  {
    path: "/guides/voicemeeter-vst3-plugins",
    page: "voicemeeterVst3Guide",
    listed: true,
    blurb: "guide — Voicemeeter inserts",
  },
  {
    path: "/guides/run-vst3-without-daw",
    page: "vst3WithoutDawGuide",
    listed: true,
    blurb: "guide — VST3 without a DAW",
  },
  { path: "/privacy", page: "privacy", listed: true, blurb: "privacy — what is stored" },
  { path: "/terms", page: "terms", listed: true, blurb: "terms — the agreement" },
  {
    path: "/refunds",
    page: "refunds",
    listed: true,
    blurb: "refunds — money and disputes",
  },
  { path: "/support", page: "support", listed: true, blurb: "support — get help" },
  // Transactional, and reached only by redirect from Stripe. Never listed, never
  // in navigation, and `noindex` in both `pageMeta` and the Vercel headers.
  {
    path: "/checkout/success",
    page: "checkoutSuccess",
    listed: false,
  },
  { path: "/concepts", page: "concepts", listed: false },
];

/** Routes safe to advertise. Excludes `/concepts` and transactional pages. */
export const publicRoutes = routes.filter((route) => route.listed);

/**
 * Matches a browser path to a route. Trailing slashes and casing are normalized
 * so `/Download/` and `/download` resolve to the same page; anything unmatched
 * is a 404 rather than a silent fallback to home.
 */
export function resolveRoute(pathname: string): RouteDef | undefined {
  const cleanPath = pathname.replace(/\/+$/, "").toLowerCase() || "/";
  return routes.find((route) => route.path === cleanPath);
}
