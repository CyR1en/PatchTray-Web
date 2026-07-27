import type { FixedPageName, ResolvedPage } from "./types";

export type RouteDef = {
  /** Canonical path. No trailing slash, lowercase. */
  path: string;
  page: FixedPageName;
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
  { path: "/faq", page: "faq", listed: true, blurb: "faq — direct product answers" },
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

export function isPotentialBlogPath(pathname: string): boolean {
  return pathname === "/blog" || pathname.startsWith("/blog/");
}

/**
 * Resolves an exact canonical browser path into a typed page model. Production
 * case compatibility is handled by explicit redirects in vercel.json; unknown,
 * mixed-case, trailing-slash, and nested paths must remain 404s in application
 * rendering instead of hydrating canonical content into a 404 response.
 */
export function resolveFixedPage(pathname: string): ResolvedPage | undefined {
  const route = routes.find((candidate) => candidate.path === pathname);
  if (route) {
    return {
      kind: "fixed",
      page: route.page,
      path: route.path,
    };
  }
  return undefined;
}

export function notFoundPage(pathname: string): ResolvedPage {
  return {
    kind: "notFound",
    page: "notFound",
    path: "/404",
    requestedPath: pathname,
  };
}

export function resolvePage(pathname: string): ResolvedPage {
  return resolveFixedPage(pathname) ?? notFoundPage(pathname);
}
