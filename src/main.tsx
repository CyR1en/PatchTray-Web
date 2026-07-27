import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { installOutcomeTracking } from "./lib/analytics";
import { loadPageComponent } from "./lib/pageLoaders";
import { isPotentialBlogPath, notFoundPage, resolveFixedPage } from "./lib/routes";
import type { ResolvedPage } from "./lib/types";
import "./styles.css";

/**
 * Analytics never needs a query string, and `/checkout/success` is reached with a
 * Stripe session id attached. The page strips it from the address bar on mount,
 * but the first pageview can fire before that — so drop it here too, for every
 * route, rather than relying on the ordering.
 */
function stripQuery(url: string): string {
  const cut = url.indexOf("?");
  return cut === -1 ? url : url.slice(0, cut);
}

async function mountApp() {
  const pathname = window.location.pathname;
  const fixedPage = resolveFixedPage(pathname);
  let resolvedPage: ResolvedPage | undefined = fixedPage;

  if (!resolvedPage && __BLOG_ENABLED__ && isPotentialBlogPath(pathname)) {
    const { resolveClientBlogPage } = await import("./lib/blogClient");
    resolvedPage = await resolveClientBlogPage(pathname);
  }

  resolvedPage ??= notFoundPage(pathname);
  const PageComponent = await loadPageComponent(resolvedPage.page);
  const appRoot = document.getElementById("root")!;
  const app = (
    <StrictMode>
      <App resolvedPage={resolvedPage} PageComponent={PageComponent} />
    </StrictMode>
  );

  if (appRoot.childElementCount > 0) {
    hydrateRoot(appRoot, app);
  } else {
    createRoot(appRoot).render(app);
  }
}

async function mountTelemetry() {
  if (window.location.hostname !== "www.patchtray.io" && window.location.hostname !== "patchtray.io") return;

  const [{ Analytics, track }, { SpeedInsights }] = await Promise.all([
    import("@vercel/analytics/react"),
    import("@vercel/speed-insights/react"),
  ]);
  installOutcomeTracking(track);
  createRoot(document.getElementById("telemetry-root")!).render(
    <StrictMode>
      <Analytics beforeSend={(event) => ({ ...event, url: stripQuery(event.url) })} />
      <SpeedInsights beforeSend={(event) => ({ ...event, url: stripQuery(event.url) })} />
    </StrictMode>,
  );
}

void mountApp();
void mountTelemetry();
