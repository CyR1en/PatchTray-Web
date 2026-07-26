import type { ComponentType } from "react";
import type { PageName } from "./types";
import { CheckoutSuccessPage } from "../pages/CheckoutSuccessPage";
import { ConceptPage } from "../pages/ConceptPage";
import { DownloadPage } from "../pages/DownloadPage";
import { GuidePage } from "../pages/GuidePage";
import { HomePage } from "../pages/HomePage";
import { PrivacyPage } from "../pages/PrivacyPage";
import { RefundsPage } from "../pages/RefundsPage";
import { SupportPage } from "../pages/SupportPage";
import { TermsPage } from "../pages/TermsPage";

export type RouteDef = {
  /** Canonical path. No trailing slash, lowercase. */
  path: string;
  page: PageName;
  component: ComponentType;
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
  { path: "/", page: "home", component: HomePage, listed: true, blurb: "home — the overview" },
  {
    path: "/download",
    page: "download",
    component: DownloadPage,
    listed: true,
    blurb: "download — get the beta",
  },
  { path: "/guide", page: "guide", component: GuidePage, listed: true, blurb: "guide — get oriented" },
  { path: "/privacy", page: "privacy", component: PrivacyPage, listed: true, blurb: "privacy — what is stored" },
  { path: "/terms", page: "terms", component: TermsPage, listed: true, blurb: "terms — the agreement" },
  {
    path: "/refunds",
    page: "refunds",
    component: RefundsPage,
    listed: true,
    blurb: "refunds — money and disputes",
  },
  { path: "/support", page: "support", component: SupportPage, listed: true, blurb: "support — get help" },
  // Transactional, and reached only by redirect from Stripe. Never listed, never
  // in navigation, and `noindex` in both `pageMeta` and the Vercel headers.
  {
    path: "/checkout/success",
    page: "checkoutSuccess",
    component: CheckoutSuccessPage,
    listed: false,
  },
  { path: "/concepts", page: "concepts", component: ConceptPage, listed: false },
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
