export const analyticsEvents = {
  downloadPage: "Download page intent",
  installerDownload: "Installer download",
  guideConversion: "Guide conversion",
  blogArticleOpen: "Blog article open",
  blogConversion: "Blog conversion",
  checkoutStart: "Checkout start",
} as const;

type Track = (name: string, properties?: Record<string, string>) => void;

/**
 * Tracks only controlled source labels or generator-validated article slugs.
 * The current route and a short UI detail are the complete payload: never add
 * query strings, hrefs, form values, email addresses, license data, or
 * arbitrary DOM text.
 */
export function installOutcomeTracking(track: Track): void {
  document.addEventListener(
    "click",
    (event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("[data-analytics-event]");
      if (!target) return;

      const name = target.dataset.analyticsEvent;
      const detail = target.dataset.analyticsDetail;
      if (!name || !detail) return;

      track(name, {
        route: window.location.pathname,
        detail,
      });
    },
    { capture: true },
  );
}
