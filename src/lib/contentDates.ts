import { faqReview } from "./faqs";
import { guideArticles } from "./guides";
import type { FixedPageName } from "./types";

/**
 * When each fixed page's content last changed substantively, as `YYYY-MM-DD`.
 *
 * One source, two readers: the legal pages render these as their effective date,
 * and the sitemap emits them as `lastmod`. Keeping them together is what stops a
 * policy from claiming one date on the page and another to a crawler.
 *
 * Most pages derive their date from the content they already carry — a guide
 * from its own `reviewed` field, the FAQ from its review record, the guides hub
 * from the newest guide it lists. Only the pages with no dated content of their
 * own are written down here, and those must be bumped by hand when the copy
 * changes. A stale `lastmod` is worse than none: it teaches a crawler to
 * distrust the signal, so leave a date alone unless the wording actually moved.
 */
export const legalEffective = {
  privacy: "2026-07-27",
  terms: "2026-07-25",
  refunds: "2026-07-25",
} as const;

/** Pages whose copy carries no date of its own. Bump when the wording changes. */
const editorialReviewed = {
  home: "2026-07-27",
  download: "2026-07-27",
  support: "2026-07-27",
} as const;

function newestGuideReview(): string {
  return guideArticles.reduce(
    (latest, article) => (article.reviewed > latest ? article.reviewed : latest),
    guideArticles[0].reviewed,
  );
}

/**
 * The `lastmod` for a fixed route, or `undefined` for routes that should not
 * advertise one. Transactional and unlisted routes never reach the sitemap, so
 * they have no date to report.
 */
export function contentDate(page: FixedPageName): string | undefined {
  if (page in legalEffective) {
    return legalEffective[page as keyof typeof legalEffective];
  }
  if (page in editorialReviewed) {
    return editorialReviewed[page as keyof typeof editorialReviewed];
  }
  if (page === "faq") return faqReview.date;
  if (page === "guides") return newestGuideReview();

  const article = guideArticles.find((candidate) => candidate.page === page);
  return article?.reviewed;
}
